import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import DashboardLayout from '../Dashboard/components/Layout/DashboardLayout';
import AnalysisOverview from './components/AnalysisOverview';
import ImageComparison from './components/ImageComparison';
import DetectionResults from './components/DetectionResults';
import BoundingBoxPreview from './components/BoundingBoxPreview';
import RepairRecommendation from './components/RepairRecommendation';
import RepairCostBreakdown from './components/RepairCostBreakdown';
import AnalysisTimeline from './components/AnalysisTimeline';
import ExportActions from './components/ExportActions';
import { getLatestAnalysis } from '../../services/aiService';
import { Alert } from '../../components/common/Alert';
import { Card } from '../../components/common/Card';

/** UI-only analysis pipeline steps (rendered from static stage definitions). */
const timelineSteps = [
  { id: 'uploaded', title: 'Image Uploaded', description: 'Damage image uploaded and validated.', timestamp: '—', status: 'completed' },
  { id: 'detection', title: 'AI Detection', description: 'Detection model located candidate damage regions.', timestamp: '—', status: 'completed' },
  { id: 'classification', title: 'Damage Classification', description: 'Damage type classified from bounding boxes.', timestamp: '—', status: 'completed' },
  { id: 'severity', title: 'Severity Prediction', description: 'Severity level and risk score computed.', timestamp: '—', status: 'completed' },
  { id: 'recommendation', title: 'Recommendation Generated', description: 'Repair method and cost estimate prepared.', timestamp: '—', status: 'completed' },
  { id: 'report', title: 'Report Completed', description: 'Final analysis report generated.', timestamp: '—', status: 'completed' },
];

/** UI-only export action definitions. */
const exportActions = [
  { id: 'export-pdf', label: 'Export PDF', description: 'Download analysis report as PDF', icon: 'file' },
  { id: 'download-image', label: 'Download Image', description: 'Download annotated detection image', icon: 'download' },
  { id: 'share-report', label: 'Share Report', description: 'Share the analysis report link', icon: 'share' },
  { id: 'print', label: 'Print', description: 'Print the analysis report', icon: 'printer' },
];

/** Title-case a snake_case value. */
const titleCase = (value = '') =>
  String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Map a damage label to a bounding-box tone. */
const TONE_BY_LABEL = {
  pothole: 'danger',
  crack: 'warning',
  edge_failure: 'danger',
  surface_wear: 'success',
  alligator_cracks: 'info',
  rutting: 'warning',
  other: 'primary',
};

/** Convert normalized (0–1) backend boxes to percentage-based overlay boxes. */
function mapBoundingBoxes(boxes = []) {
  return boxes.map((box, index) => {
    const x1 = Number(box.x1 || 0);
    const y1 = Number(box.y1 || 0);
    const x2 = Number(box.x2 || 0);
    const y2 = Number(box.y2 || 0);
    return {
      id: `box-${index + 1}`,
      label: titleCase(box.label),
      confidence: Math.round(Number(box.confidence || 0) * 100),
      tone: TONE_BY_LABEL[String(box.label).toLowerCase()] || 'primary',
      left: x1 * 100,
      top: y1 * 100,
      width: Math.max((x2 - x1) * 100, 1),
      height: Math.max((y2 - y1) * 100, 1),
    };
  });
}

/** Build detection table rows from backend detections (fallback to summary row). */
function mapDetectionResults(analysis) {
  const detections = analysis.detections || [];
  const severity = titleCase(analysis.severity);
  const riskScore = Math.round(Number(analysis.risk_score || 0));
  const roadCondition = analysis.road_condition || 'N/A';
  const confidence = Math.round(Number(analysis.confidence || 0) * 100);

  if (detections.length > 0) {
    return detections.map((det, index) => ({
      id: index + 1,
      damageType: titleCase(det.label),
      severity,
      confidence: Math.round(Number(det.confidence || 0) * 100),
      riskScore,
      roadCondition,
      status: 'Confirmed',
    }));
  }

  return [{
    id: 1,
    damageType: titleCase(analysis.damage_type),
    severity,
    confidence,
    riskScore,
    roadCondition,
    status: 'Confirmed',
  }];
}

/** Format processing time from milliseconds. */
function formatProcessingTime(ms) {
  const value = Number(ms || 0);
  if (value <= 0) return 'N/A';
  if (value < 1000) return `${Math.round(value)} ms`;
  return `${(value / 1000).toFixed(1)} seconds`;
}

/** Format an ISO timestamp for display. */
function formatAnalyzedAt(iso) {
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

/** Stagger container for page sections. */
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/** Fade-up animation for each child. */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function AIAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    getLatestAnalysis()
      .then((data) => {
        if (cancelled) return;
        setAnalysis(data);
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load the latest analysis.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const boxes = analysis ? mapBoundingBoxes(analysis.bounding_boxes) : [];
  const results = analysis ? mapDetectionResults(analysis) : [];
  const cost = analysis?.cost_breakdown || {};
  const costItems = [
    { name: 'Material', value: Number(cost.material || 0) },
    { name: 'Labor', value: Number(cost.labor || 0) },
    { name: 'Equipment', value: Number(cost.equipment || 0) },
  ].filter((item) => item.value > 0);

  const totalCost = Number(analysis?.estimated_repair_cost) || costItems.reduce((sum, item) => sum + item.value, 0);

  const legend = boxes.map((box) => ({ key: box.tone, label: box.label }));

  return (
    <DashboardLayout pageTitle="AI Analysis">
      <motion.div
        className="space-y-6 sm:space-y-8"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* Breadcrumb */}
        <motion.nav
          variants={fadeUp}
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-secondary-500 dark:text-dark-400"
        >
          <Link
            to="/dashboard"
            className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            Dashboard
          </Link>
          <ChevronRight size={12} className="text-secondary-400 dark:text-dark-500" aria-hidden="true" />
          <span aria-current="page" className="font-medium text-secondary-700 dark:text-dark-200">
            AI Analysis
          </span>
        </motion.nav>

        {/* Heading */}
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-dark-100">
            AI Analysis Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-secondary-500 dark:text-dark-400">
            Deep learning-powered road damage detection and repair intelligence.
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div variants={fadeUp}>
            <Alert variant="warning" title="No analysis available">
              {error} Run an analysis on a report to see results here.
            </Alert>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <motion.div variants={fadeUp}>
            <Card bordered className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 size={28} className="animate-spin text-primary-500" aria-hidden="true" />
              <p className="text-sm font-medium text-secondary-600 dark:text-dark-300">
                Loading latest analysis...
              </p>
            </Card>
          </motion.div>
        )}

        {/* Content */}
        {!loading && !error && analysis && (
          <>
            {/* Overview */}
            <motion.div variants={fadeUp}>
              <AnalysisOverview
                analysisId={analysis.analysis_id}
                processingTime={formatProcessingTime(analysis.processing_time_ms)}
                modelVersion={analysis.model_version}
                confidence={Math.round(Number(analysis.confidence || 0) * 100)}
                detectionStatus={titleCase(analysis.analysis_status)}
                analyzedAt={formatAnalyzedAt(analysis.completed_at)}
              />
            </motion.div>

            {/* Image comparison */}
            <motion.div variants={fadeUp}>
              <ImageComparison boxes={boxes} />
            </motion.div>

            {/* Detection results + bounding box preview */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5"
            >
              <div className="lg:col-span-2 min-w-0">
                <DetectionResults results={results} />
              </div>
              <div className="min-w-0">
                <BoundingBoxPreview boxes={boxes} legend={legend} />
              </div>
            </motion.div>

            {/* Repair recommendation + cost breakdown */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5"
            >
              <RepairRecommendation
                recommendation={analysis.summary}
                method={analysis.repair_method}
                duration={analysis.expected_duration_days ? `${analysis.expected_duration_days} days` : 'N/A'}
                equipment={analysis.equipment || []}
                safetyPrecautions={analysis.notes}
                priority={titleCase(analysis.priority)}
              />
              <RepairCostBreakdown
                materialCost={Number(cost.material || 0)}
                laborCost={Number(cost.labor || 0)}
                equipmentCost={Number(cost.equipment || 0)}
                totalEstimatedCost={totalCost}
                items={costItems}
              />
            </motion.div>

            {/* Timeline */}
            <motion.div variants={fadeUp}>
              <AnalysisTimeline steps={timelineSteps} />
            </motion.div>

            {/* Export actions */}
            <motion.div variants={fadeUp}>
              <ExportActions actions={exportActions} />
            </motion.div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
