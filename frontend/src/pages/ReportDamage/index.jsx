import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Brain, RefreshCw, AlertCircle, CheckCircle2, ScanSearch } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../Dashboard/components/Layout/DashboardLayout';
import { useReportDamageForm } from './hooks/useReportDamageForm';
import { useAISimulation } from './hooks/useAISimulation';
import { useReportHistory } from '../../hooks/useReportHistory';
import ImageUpload from './components/Upload/ImageUpload';
import UploadProgress from './components/Upload/UploadProgress';
import CameraCapture from './components/Camera/CameraCapture';
import LocationPicker from './components/Location/LocationPicker';
import DamageDetails from './components/Form/DamageDetails';
import AIProcessingCard from './components/AI/AIProcessingCard';
import AIResultsCard from './components/AI/AIResultsCard';
import DamageSummaryCard from './components/AI/DamageSummaryCard';
import ConfidenceScoreCard from './components/AI/ConfidenceScoreCard';
import PriorityCard from './components/AI/PriorityCard';
import RepairRecommendationCard from './components/AI/RepairRecommendationCard';
import RepairCostCard from './components/AI/RepairCostCard';
import DetectionTimeline from './components/AI/DetectionTimeline';
import SubmissionSuccessModal from './components/Submit/SubmissionSuccessModal';
import ReportHistoryList from './components/History/ReportHistoryList';
import { Alert } from '../../components/common/Alert';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Divider } from '../../components/common/Divider';

/**
 * ReportDamage page — Road damage reporting form with real AI processing.
 *
 * Flow:
 *   1. User fills form (road name, description, location, image upload).
 *   2. On submit, the image is uploaded to /upload, a report is created via
 *      /reports, and the REAL YOLO endpoint POST /ai/predict is called.
 *   3. If the real endpoint fails, the mock /ai/analyze endpoint is used as
 *      a fallback so the UI always works.
 *   4. Results are displayed with bounding boxes overlaid on the uploaded image.
 */

/** Generate a unique temporary report number like RS-2026-000245. */
function generateReportId(reports = []) {
  const year = new Date().getFullYear();
  const maxSeq = reports.reduce((max, report) => {
    const match = /RS-\d{4}-(\d{6})/.exec(report.id || '');
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `RS-${year}-${String(maxSeq + 1).padStart(6, '0')}`;
}

/** Convert a File object to a data URL for localStorage persistence. */
function fileToDataUrl(file) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/** Title-case a snake_case value. */
const titleCase = (value = '') =>
  String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Map a damage label to a bounding-box tone. */
const TONE_BY_LABEL = {
  pothole: 'danger',
  crack: 'warning',
  longitudinal_crack: 'warning',
  transverse_crack: 'warning',
  alligator_crack: 'danger',
  alligator_cracks: 'danger',
  patchy_road_section: 'success',
  lane_line_blur: 'info',
  manhole_cover: 'primary',
  edge_failure: 'danger',
  surface_wear: 'success',
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
    const label = box.label || 'Damage';
    return {
      id: `box-${index + 1}`,
      label: titleCase(label),
      confidence: Math.round(Number(box.confidence || 0) * 100),
      tone: TONE_BY_LABEL[String(label).toLowerCase()] || 'primary',
      left: x1 * 100,
      top: y1 * 100,
      width: Math.max((x2 - x1) * 100, 1),
      height: Math.max((y2 - y1) * 100, 1),
    };
  });
}

/**
 * DetectionImageOverlay — Renders the uploaded image with YOLO bounding boxes
 * overlaid on top, using normalized (0–1) coordinates converted to percentages.
 */
function DetectionImageOverlay({ imageUrl, boxes = [], isRealAI = false }) {
  if (!imageUrl) return null;

  const mappedBoxes = mapBoundingBoxes(boxes);

  return (
    <section aria-label="Detection image with bounding boxes">
      <div className="relative rounded-xl overflow-hidden border border-secondary-200 dark:border-dark-700 bg-secondary-100 dark:bg-dark-800">
        <img
          src={imageUrl}
          alt="Uploaded road damage with AI detection boxes"
          className="block w-full h-auto"
        />
        {/* Bounding box overlays */}
        {mappedBoxes.map((box) => {
          const toneClass = {
            danger: 'border-danger-400 dark:border-danger-500',
            warning: 'border-warning-400 dark:border-warning-500',
            success: 'border-success-400 dark:border-success-500',
            info: 'border-info-400 dark:border-info-500',
            primary: 'border-primary-400 dark:border-primary-500',
          }[box.tone] || 'border-primary-400 dark:border-primary-500';

          const labelBgClass = {
            danger: 'bg-danger-500',
            warning: 'bg-warning-500',
            success: 'bg-success-500',
            info: 'bg-info-500',
            primary: 'bg-primary-500',
          }[box.tone] || 'bg-primary-500';

          return (
            <div
              key={box.id}
              className={`absolute border-2 rounded-sm ${toneClass}`}
              style={{
                left: `${box.left}%`,
                top: `${box.top}%`,
                width: `${box.width}%`,
                height: `${box.height}%`,
              }}
            >
              <span
                className={`absolute -top-6 left-0 px-1.5 py-0.5 text-2xs font-semibold rounded text-white ${labelBgClass}`}
              >
                {box.label} {box.confidence}%
              </span>
            </div>
          );
        })}
      </div>
      {!isRealAI && (
        <p className="mt-2 text-xs text-secondary-500 dark:text-dark-400">
          <Brain size={12} className="inline mr-1" aria-hidden="true" />
          Mock AI simulation — bounding boxes are illustrative.
        </p>
      )}
    </section>
  );
}

/**
 * NoDetectionState — Clear message when YOLO detects no damage.
 */
function NoDetectionState({ onEditAnalysis }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card padding="lg" bordered hoverable={false} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/5 via-transparent to-primary-500/5 dark:from-secondary-500/10 dark:to-primary-500/10 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 flex flex-col items-center text-center py-10">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary-100 dark:bg-dark-800 text-secondary-500 dark:text-dark-400 mb-4">
            <ScanSearch size={28} aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-dark-100 mb-2">
            No Damage Detected
          </h3>
          <p className="text-sm text-secondary-500 dark:text-dark-400 max-w-md mb-4">
            The AI model analyzed the uploaded image and found no road damage
            above the confidence threshold. The road surface appears to be in
            good condition.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={onEditAnalysis}
            aria-label="Upload a different image for analysis"
          >
            Analyze Different Image
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

/**
 * ErrorState — Clear error message with retry option.
 */
function ErrorState({ error, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card padding="lg" bordered hoverable={false} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-danger-500/5 via-transparent to-warning-500/5 dark:from-danger-500/10 dark:to-warning-500/10 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 flex flex-col items-center text-center py-10">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-danger-100 dark:bg-danger-900/30 text-danger-500 dark:text-danger-400 mb-4">
            <AlertCircle size={28} aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-dark-100 mb-2">
            Analysis Failed
          </h3>
          <p className="text-sm text-secondary-500 dark:text-dark-400 max-w-md mb-4">
            {error || 'An unexpected error occurred during AI analysis.'}
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            leftIcon={RefreshCw}
            onClick={onRetry}
            aria-label="Retry analysis"
          >
            Try Again
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

export default function ReportDamage() {
  const navigate = useNavigate();
  const [showSimulation, setShowSimulation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSubmittedReport, setLastSubmittedReport] = useState(null);
  const historyRef = useRef(null);

  const { reports, addReport, updateReport } = useReportHistory();

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    validateAll,
    resetForm: resetFormState,
  } = useReportDamageForm();

  const {
    uploadProgress,
    uploadStage,
    processingStage,
    estimatedTime,
    isUploading,
    isProcessing,
    isComplete,
    results,
    error: aiError,
    startSimulation,
    resetSimulation,
  } = useAISimulation();

  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  // Generate preview URL when image changes
  useEffect(() => {
    if (values.image instanceof File) {
      const url = URL.createObjectURL(values.image);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setImagePreviewUrl(null);
  }, [values.image]);

  /**
   * Submit the analyzed report after the backend analysis completes.
   * Keeps the same success modal and UI flow, but now persists the live result shape.
   */
  const handleSubmitReport = useCallback(async () => {
    if (isSubmitting || isSubmitted || !results) return;

    setIsSubmitting(true);

    const report = {
      id: results.reportId || generateReportId(reports),
      roadName: results.roadName || values.roadName || '',
      address: results.location || values.address || '',
      latitude: values.latitude || null,
      longitude: values.longitude || null,
      image: values.image ? await fileToDataUrl(values.image) : null,
      damageType: results.damageType || '',
      severity: results.severity || '',
      confidence: results.confidence || 0,
      repairCost: results.estimatedRepairCost || 0,
      priority: results.repairPriority || '',
      createdAt: results.uploadTime || new Date().toISOString(),
      status: 'Submitted',
      aiVersion: results.modelVersion || 'backend-v1',
      reportNumber: results.reportId || results.id,
    };

    addReport(report);
    updateReport(report.id, report);
    setLastSubmittedReport(report);
    setIsSubmitted(true);
    setIsSubmitting(false);
    setShowSuccessModal(true);
  }, [isSubmitting, isSubmitted, results, values, addReport, updateReport, reports]);

  /**
   * Return to the form to re-analyze a different image.
   */
  const handleAnalyzeNewImage = useCallback(() => {
    resetSimulation();
    setShowSimulation(false);
    setIsSubmitted(false);
    setIsSubmitting(false);
    setLastSubmittedReport(null);
  }, [resetSimulation]);

  /**
   * Close the success modal and scroll to the report history section.
   */
  const handleViewReports = useCallback(() => {
    setShowSuccessModal(false);
    requestAnimationFrame(() => {
      historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  /**
   * Close the success modal and navigate back to the dashboard.
   */
  const handleBackToDashboard = useCallback(() => {
    setShowSuccessModal(false);
    navigate('/dashboard');
  }, [navigate]);

  /**
   * Navigate back to the report form from the empty history state.
   */
  const handleCreateFirstReport = useCallback(() => {
    resetSimulation();
    setShowSimulation(false);
    setIsSubmitted(false);
    setIsSubmitting(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resetSimulation]);

  /**
   * Handle form submission attempt.
   * Validates then starts the real AI analysis pipeline.
   */
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const isValid = validateAll();
    if (isValid) {
      setShowSimulation(true);
      startSimulation({
        ...values,
        roadName: values.roadName,
        roadType: values.roadType,
        address: values.address,
        latitude: values.latitude,
        longitude: values.longitude,
        description: values.description,
        severity: values.severity,
        image: values.image,
      });
    }
  }, [validateAll, startSimulation, values]);

  /**
   * Reset everything - form and simulation.
   */
  const handleReset = useCallback(() => {
    resetFormState();
    resetSimulation();
    setShowSimulation(false);
  }, [resetFormState, resetSimulation]);

  /**
   * Map simulation processing stage to timeline active step.
   */
  const getActiveTimelineStep = () => {
    const stepMap = {
      initializing: 'detection',
      loading_model: 'detection',
      detecting: 'detection',
      analyzing_surface: 'classification',
      classifying: 'severity',
      generating: 'ready',
    };
    const id = processingStage?.id || '';
    if (isUploading) return 'verified';
    if (id && stepMap[id]) return stepMap[id];
    if (isComplete) return 'ready';
    return null;
  };

  return (
    <DashboardLayout pageTitle="Report Damage">
      <div className="space-y-6 sm:space-y-8">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex items-center gap-2 text-sm text-secondary-500 dark:text-dark-400"
          aria-label="Breadcrumb"
        >
          <Link
            to="/dashboard"
            className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            Dashboard
          </Link>
          <ChevronRight size={14} className="text-secondary-400 dark:text-dark-500" aria-hidden="true" />
          <span className="text-secondary-900 dark:text-dark-100 font-medium" aria-current="page">
            Report Damage
          </span>
        </motion.nav>

        {/* Page heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-dark-100">
            Report Road Damage
          </h1>
          <p className="mt-2 text-secondary-600 dark:text-dark-300 max-w-2xl">
            Upload an image of damaged roads for AI-powered analysis and intelligent maintenance recommendations.
          </p>
          <Divider className="mt-4" />
        </motion.div>

        {/* Form */}
        {!showSimulation && (
          <form onSubmit={handleSubmit} noValidate aria-label="Report damage form">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Left column */}
              <div className="space-y-6 sm:space-y-8">
                <ImageUpload
                  value={values.image}
                  onChange={(file) => setFieldValue('image', file)}
                  error={errors.image}
                  touched={touched.image}
                />
                <CameraCapture />
              </div>

              {/* Right column */}
              <div className="space-y-6 sm:space-y-8">
                <LocationPicker
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  setFieldValue={setFieldValue}
                />
                <DamageDetails
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />
              </div>
            </div>

            {/* Form actions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
              className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-xl bg-white dark:bg-dark-900 border border-secondary-200 dark:border-dark-800"
            >
              <div className="flex items-center gap-2 text-sm text-secondary-500 dark:text-dark-400">
                <Brain size={16} aria-hidden="true" />
                <span>Real AI analysis will run after submission.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={handleReset}
                  aria-label="Reset form"
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  leftIcon={CheckCircle2}
                  className="w-full sm:w-auto"
                  aria-label="Submit damage report for AI analysis"
                >
                  Start AI Analysis
                </Button>
              </div>
            </motion.div>
          </form>
        )}

        {/* Simulation section (shown after form submit) */}
        {showSimulation && (
          <div className="space-y-6 sm:space-y-8">
            {/* Upload Progress */}
            {(isUploading || isComplete) && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <UploadProgress progress={uploadProgress} stage={uploadStage} />
              </motion.div>
            )}

            {/* AI Processing Card */}
            {(isProcessing || isUploading) && (
              <AIProcessingCard stage={processingStage} estimatedTime={estimatedTime} />
            )}

            {/* Error state */}
            {!isUploading && !isProcessing && aiError && (
              <ErrorState error={aiError} onRetry={() => startSimulation({ ...values })} />
            )}

            {/* Results section (shown after completion) */}
            {isComplete && results && !aiError && (
              <>
                {/* Detection image with bounding boxes */}
                {imagePreviewUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                  >
                    <Card padding="lg" bordered hoverable={false}>
                      <div className="flex items-center gap-2 mb-3">
                        <ScanSearch size={16} className="text-primary-500" aria-hidden="true" />
                        <h3 className="text-lg font-semibold text-secondary-900 dark:text-dark-100">
                          Detection Results
                        </h3>
                        {results.isRealAI && (
                          <Badge variant="success" size="sm" pill>
                            Real AI
                          </Badge>
                        )}
                        {!results.isRealAI && (
                          <Badge variant="info" size="sm" pill>
                            Mock AI
                          </Badge>
                        )}
                      </div>
                      <DetectionImageOverlay
                        imageUrl={imagePreviewUrl}
                        boxes={results.boundingBoxes || []}
                        isRealAI={results.isRealAI}
                      />
                    </Card>
                  </motion.div>
                )}

                {/* No detection state */}
                {!results.damageDetected && results.isRealAI && (
                  <NoDetectionState onEditAnalysis={handleAnalyzeNewImage} />
                )}

                {/* AI Results Card (only show if damage was detected) */}
                {results.damageDetected && (
                  <AIResultsCard
                    data={results}
                    isSubmitting={isSubmitting}
                    isSubmitted={isSubmitted}
                    onSubmitReport={handleSubmitReport}
                    onEditAnalysis={handleAnalyzeNewImage}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                      {/* Left column */}
                      <div className="space-y-6 sm:space-y-8">
                        <DamageSummaryCard
                          roadName={results.roadName || values.roadName || ''}
                          roadType={results.roadType || values.roadType || ''}
                          damageType={results.damageType}
                          severity={results.severity}
                          location={results.location}
                          uploadTime={results.uploadTime}
                          status={results.status}
                          overallDamageScore={results.overallDamageScore}
                        />
                        <ConfidenceScoreCard
                          confidence={results.confidence}
                          confidenceLabel={results.confidenceLabel}
                        />
                        <PriorityCard
                          repairPriority={results.repairPriority}
                          expectedResponse={results.expectedResponse}
                          riskScore={results.riskScore}
                        />
                      </div>

                      {/* Right column */}
                      <div className="space-y-6 sm:space-y-8">
                        <RepairRecommendationCard
                          repairRecommendation={results.repairRecommendation}
                          recommendedMethod={results.recommendedMethod}
                          duration={results.duration}
                          equipment={results.equipment}
                          safetyNotes={results.safetyNotes}
                        />
                        <RepairCostCard
                          estimatedRepairCost={results.estimatedRepairCost}
                          materialCost={results.materialCost}
                          laborCost={results.laborCost}
                          equipmentCost={results.equipmentCost}
                        />
                        <DetectionTimeline activeStep={getActiveTimelineStep()} />
                      </div>
                    </div>
                  </AIResultsCard>
                )}
              </>
            )}
          </div>
        )}

        {/* Future integration notice (only when not in simulation mode) */}
        {!showSimulation && (
          <Alert variant="info" className="mb-8">
            <p className="text-sm">
              <strong className="font-semibold">Real AI Detection:</strong> The system uses a custom-trained YOLOv8 model
              for real-time road damage detection. Upload an image to get instant analysis with severity assessment,
              cost estimation, and maintenance recommendations.
            </p>
          </Alert>
        )}

        {/* Report History */}
        <div ref={historyRef} className="scroll-mt-24">
          <ReportHistoryList
            reports={reports}
            onCreateFirstReport={handleCreateFirstReport}
          />
        </div>

        {/* Submission Success Modal */}
        <SubmissionSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          report={lastSubmittedReport}
          onViewReports={handleViewReports}
          onBackToDashboard={handleBackToDashboard}
        />
      </div>
    </DashboardLayout>
  );
}
