import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle2, Brain, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../Dashboard/components/Layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Divider } from '../../components/common/Divider';
import { useReportDamageForm } from './hooks/useReportDamageForm';
import { useAISimulation } from './hooks/useAISimulation';
import ImageUpload from './components/Upload/ImageUpload';
import UploadProgress from './components/Upload/UploadProgress';
import CameraCapture from './components/Camera/CameraCapture';
import LocationPicker from './components/Location/LocationPicker';
import DamageDetails from './components/Form/DamageDetails';
import AIProcessingCard from './components/AI/AIProcessingCard';
import DetectionTimeline from './components/AI/DetectionTimeline';
import AIResultsCard from './components/AI/AIResultsCard';
import ConfidenceScoreCard from './components/AI/ConfidenceScoreCard';
import RepairRecommendationCard from './components/AI/RepairRecommendationCard';
import RepairCostCard from './components/AI/RepairCostCard';
import PriorityCard from './components/AI/PriorityCard';
import DamageSummaryCard from './components/AI/DamageSummaryCard';
import SubmissionSuccessModal from './components/Submit/SubmissionSuccessModal';
import ReportHistoryList from './components/History/ReportHistoryList';
import { useReportHistory } from '../../hooks/useReportHistory';

/**
 * ReportDamage page - Road damage reporting form with AI processing simulation.
 * UI only. No AI detection, backend integration, or submission logic.
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
    startSimulation,
    resetSimulation,
  } = useAISimulation();

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
   * Close the success modal and navigate to the dashboard.
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
   * Validates then simulates AI processing.
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
        <form onSubmit={handleSubmit} noValidate aria-label="Report damage form">
          {/* Main form sections (hidden during processing/complete) */}
          {!showSimulation && (
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

              {/* Results section (shown after completion) */}
              {isComplete && results && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  {/* AI Results Dashboard — AIResultsCard acts as the API-ready parent container */}
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
                          roadName={results.roadName}
                          roadType={results.roadType}
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

                        {/* Re-analysis action */}
                        <div className="flex items-center justify-center p-6 rounded-xl bg-white dark:bg-dark-900 border border-secondary-200 dark:border-dark-800">
                          <Button
                            type="button"
                            variant="ghost"
                            size="md"
                            leftIcon={RotateCcw}
                            onClick={handleAnalyzeNewImage}
                            aria-label="Re-analyze with different image"
                          >
                            Analyze New Image
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AIResultsCard>
                </motion.div>
              )}
            </div>
          )}

          {/* Form actions */}
          {!showSimulation && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
              className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-xl bg-white dark:bg-dark-900 border border-secondary-200 dark:border-dark-800"
            >
              <div className="flex items-center gap-2 text-sm text-secondary-500 dark:text-dark-400">
                <Brain size={16} aria-hidden="true" />
                <span>AI analysis will run after submission.</span>
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
                  disabled={isUploading || isProcessing}
                >
                  Start AI Analysis
                </Button>
              </div>
            </motion.div>
          )}
        </form>

        {/* Future integration notice */}
        {!showSimulation && (
          <Alert variant="info" className="mb-8">
            <p className="text-sm">
              <strong className="font-semibold">Coming soon:</strong> Real AI-powered damage detection, cost estimation,
              and automated report generation will be available in future updates.
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
