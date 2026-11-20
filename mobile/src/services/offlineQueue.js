/**
 * Offline queue — lightweight offline support using AsyncStorage.
 *
 * When the network is unavailable, a pending inspection {imageUri, gps,
 * roadName, description} is stored locally and queued for later upload.
 * When connectivity returns, syncQueue() replays each entry through the
 * normal upload → createReport → predict pipeline and clears it on success.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { uploadRoadImage, createReport, predictImage } from './inspectionService';

/** Read the whole queue. */
export async function getQueue() {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.offlineQueue);
        return raw ? JSON.parse(raw) : [];
    } catch (_) {
        return [];
    }
}

/** Persist the queue back to storage. */
async function saveQueue(queue) {
    await AsyncStorage.setItem(STORAGE_KEYS.offlineQueue, JSON.stringify(queue));
}

/** Add a pending inspection to the offline queue. */
export async function enqueueInspection(entry) {
    const queue = await getQueue();
    const item = {
        id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        ...entry,
    };
    queue.push(item);
    await saveQueue(queue);
    return item;
}

/** Remove one queued item by id. */
export async function removeFromQueue(id) {
    const queue = await getQueue();
    const next = queue.filter((item) => item.id !== id);
    await saveQueue(next);
    return next.length;
}

/**
 * Replay every queued inspection through the real backend pipeline.
 *
 * @param {function} [onProgress] - (remaining, total) callback per item
 * @returns {{synced: number, failed: number}} counts
 */
export async function syncQueue(onProgress) {
    const queue = await getQueue();
    if (queue.length === 0) return { synced: 0, failed: 0 };

    let synced = 0;
    let failed = 0;
    const total = queue.length;

    for (const item of queue) {
        try {
            // 1. Upload image
            const meta = await uploadRoadImage(item.imageUri);
            // 2. Create report with GPS + image reference
            const report = await createReport({
                roadName: item.roadName || 'Mobile Inspection',
                description:
                    item.description ||
                    'Road damage inspection captured from the RoadSense mobile app.',
                latitude: item.latitude ?? null,
                longitude: item.longitude ?? null,
                imagePath: meta?.path || null,
            });
            // 3. Run YOLO inference — backend persists the inspection via report_id
            await predictImage(item.imageUri, report.id);
            synced += 1;
            await removeFromQueue(item.id);
        } catch (_) {
            failed += 1; // keep in queue for the next sync attempt
        }
        if (onProgress) onProgress(total - synced - failed + failed, total);
    }
    return { synced, failed };
}