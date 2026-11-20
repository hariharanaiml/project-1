/** Formatting helpers shared across screens. */
import { DAMAGE_LABELS } from '../constants';

export function titleCase(value = '') {
    return String(value)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function damageLabel(value) {
    return DAMAGE_LABELS[value] || titleCase(value || 'Unknown');
}

export function formatDate(iso) {
    if (!iso) return 'N/A';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso) {
    if (!iso) return 'N/A';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatCurrency(value, currency = 'INR') {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return 'N/A';
    const symbol = currency === 'INR' ? '₹' : `${currency} `;
    return `${symbol}${num.toLocaleString('en-IN')}`;
}

export function formatCostRange(range, currency = 'INR') {
    if (!range) return null;
    const min = Number(range.min || 0);
    const max = Number(range.max || 0);
    if (min <= 0 && max <= 0) return null;
    const symbol = currency === 'INR' ? '₹' : `${currency} `;
    return `${symbol}${min.toLocaleString('en-IN')} – ${symbol}${max.toLocaleString('en-IN')}`;
}

export function formatConfidence(confidence) {
    const value = Number(confidence);
    if (!Number.isFinite(value)) return 'N/A';
    // Accept both 0–1 and 0–100 scales.
    const pct = value <= 1 ? Math.round(value * 100) : Math.round(value);
    return `${pct}%`;
}