import { useState, useCallback, useRef, useEffect } from 'react';
import { uploadImage } from '../../../services/uploadService';
import { createReport } from '../../../services/reportService';
import { analyzeReport, normalizeAIResult } from '../../../services/aiService';

/** Upload simulation stages */
const UPLOAD_STAGES = [
  { progress: 25, label: 'Uploading...' },
  { progress: 55, label: 'Validating Image...' },
  { progress: 85, label: 'Preparing AI Analysis...' },
  { progress: 100, label: 'Completed' },
];

/** AI processing stages with estimated per-stage duration (ms) */
const PROCESSING_STAGES = [
  { id: 'initializing', label: 'Initializing...', duration: 1500 },
  { id: 'loading_model', label: 'Loading AI Model...', duration: 2000 },
  { id: 'detecting', label: 'Detecting Road Damage...', duration: 3000 },
  { id: 'analyzing_surface', label: 'Analyzing Surface...', duration: 2500 },
  { id: 'classifying', label: 'Classifying Severity...', duration: 2000 },
  { id: 'generating', label: 'Generating Report...', duration: 1500 },
];

/** Simulation states */
const STATE = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error',
};

/**
 * useAISimulation hook - Real backend-driven upload and AI analysis pipeline.
 * The UI contract remains unchanged so the page layout never needs redesign.
 *
 * @returns {Object} Simulation state and controls
 */
export function useAISimulation() {
  const [state, setState] = useState(STATE.IDLE);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [processingStage, setProcessingStage] = useState({ id: '', label: '' });
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const stageFromProgress = useCallback((progress) => {
    if (progress < 35) return 'Uploading...';
    if (progress < 75) return 'Validating Image...';
    if (progress < 100) return 'Preparing AI Analysis...';
    return 'Completed';
  }, []);


  /**
   * Start the real upload → create report → analyze report flow.
   */
  const startSimulation = useCallback(async (payload = {}) => {
    setError(null);
    setResults(null);
    setState(STATE.UPLOADING);
    setUploadProgress(0);
    setUploadStage('Uploading...');
    setProcessingStage({ id: 'initializing', label: 'Initializing...' });
    setEstimatedTime(0);

    try {
      const file = payload.image;
      if (!file) {
        throw new Error('Please upload an image before starting AI analysis.');
      }

      const uploadMeta = await uploadImage(file, (percent) => {
        if (!mountedRef.current) return;
        setUploadProgress(percent);
        setUploadStage(stageFromProgress(percent));
      });

      const createPayload = {
        road_name: payload.roadName || '',
        description: payload.description || '',
        road_type: payload.roadType || null,
        address: payload.address || '',
        latitude: payload.latitude ? Number(payload.latitude) : null,
        longitude: payload.longitude ? Number(payload.longitude) : null,
        image_path: uploadMeta?.path || uploadMeta?.filename || null,
        severity: payload.severity && payload.severity !== 'auto_detect' ? payload.severity : null,
      };

      const createdReport = await createReport(createPayload);

      setUploadProgress(100);
      setUploadStage('Completed');
      setState(STATE.PROCESSING);
      setProcessingStage(PROCESSING_STAGES[0]);
      setEstimatedTime(6);

      const aiResponse = await analyzeReport({
        report_id: createdReport.id,
        image_path: createPayload.image_path,
      });

      const normalized = normalizeAIResult(aiResponse);
      const enrichedResult = {
        ...normalized,
        roadName: createdReport.roadName || payload.roadName || '',
        location: createdReport.address || payload.address || '',
        uploadTime: createdReport.createdAt || new Date().toISOString(),
        reportId: createdReport.id,
      };

      setResults(enrichedResult);
      setProcessingStage({ id: 'generating', label: 'Generating Report...' });
      setEstimatedTime(0);
      setState(STATE.COMPLETED);
    } catch (err) {
      if (mountedRef.current) {
        setError(err?.message || 'AI analysis failed');
        setState(STATE.ERROR);
      }
    }
  }, [stageFromProgress]);

  /**
   * Stop simulation at any point.
   */
  const stopSimulation = useCallback(() => {
    setState(STATE.IDLE);
    setUploadProgress(0);
    setUploadStage('');
    setProcessingStage({ id: '', label: '' });
    setEstimatedTime(0);
  }, []);

  /**
   * Reset simulation to idle.
   */
  const resetSimulation = useCallback(() => {
    setState(STATE.IDLE);
    setUploadProgress(0);
    setUploadStage('');
    setProcessingStage({ id: '', label: '' });
    setEstimatedTime(0);
    setResults(null);
    setError(null);
  }, []);

  /**
   * Set simulation results manually (for future API integration).
   */
  const setSimulationResults = useCallback((data) => {
    setResults(data);
    setState(STATE.COMPLETED);
  }, []);

  return {
    state,
    uploadProgress,
    uploadStage,
    processingStage,
    estimatedTime,
    results,
    loading: state === STATE.UPLOADING || state === STATE.PROCESSING,
    error,
    isUploading: state === STATE.UPLOADING,
    isProcessing: state === STATE.PROCESSING,
    isComplete: state === STATE.COMPLETED,
    isIdle: state === STATE.IDLE,
    isError: state === STATE.ERROR,

    startSimulation,
    stopSimulation,
    resetSimulation,
    setSimulationResults,

    UPLOAD_STAGES,
    PROCESSING_STAGES,
    STATE,
  };
}
