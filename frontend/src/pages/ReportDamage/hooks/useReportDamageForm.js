import { useState, useCallback, useMemo } from 'react';

/**
 * Form validation and state management hook for Report Damage page.
 * Designed for future AI inference integration without UI changes.
 *
 * @returns {Object} Form state, handlers, and validation utilities
 */
export function useReportDamageForm() {
  const [values, setValues] = useState({
    image: null,
    roadName: '',
    description: '',
    roadType: '',
    severity: 'Auto Detect',
    latitude: '',
    longitude: '',
    address: '',
    // Future AI fields (placeholders only - no logic implemented)
    detectedDamageType: null,
    confidence: null,
    estimatedRepairCost: null,
    repairPriority: null,
    aiProcessed: false,
    aiModel: null,
    processedImage: null,
    reportId: null,
    createdAt: null,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /**
   * Validate a single field or all fields.
   */
  const validate = useCallback((fieldValues = values) => {
    const newErrors = {};

    // Image required
    if (!fieldValues.image) {
      newErrors.image = 'Please upload an image of the road damage.';
    }

    // Road name required
    if (!fieldValues.roadName || !fieldValues.roadName.trim()) {
      newErrors.roadName = 'Road name is required.';
    }

    // Description required + minimum 20 characters
    if (!fieldValues.description || !fieldValues.description.trim()) {
      newErrors.description = 'Damage description is required.';
    } else if (fieldValues.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters.';
    }

    // Road type required
    if (!fieldValues.roadType) {
      newErrors.roadType = 'Please select a road type.';
    }

    setErrors(newErrors);
    return newErrors;
  }, [values]);

  /**
   * Check if the form is valid (no errors).
   */
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  /**
   * Handle input change.
   */
  const handleChange = useCallback((field) => (e) => {
    const value = e.target ? e.target.value : e;
    setValues((prev) => ({ ...prev, [field]: value }));

    // Clear error on change if field was touched
    setErrors((prev) => {
      if (prev[field]) {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      }
      return prev;
    });
  }, []);

  /**
   * Handle blur for touched tracking.
   */
  const handleBlur = useCallback((field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  /**
   * Set a field value programmatically (e.g., for image upload).
   */
  const setFieldValue = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    // Clear error if set
    setErrors((prev) => {
      if (prev[field]) {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      }
      return prev;
    });
  }, []);

  /**
   * Reset the entire form.
   */
  const resetForm = useCallback(() => {
    setValues({
      image: null,
      roadName: '',
      description: '',
      roadType: '',
      severity: 'Auto Detect',
      latitude: '',
      longitude: '',
      address: '',
      detectedDamageType: null,
      confidence: null,
      estimatedRepairCost: null,
      repairPriority: null,
      aiProcessed: false,
      aiModel: null,
      processedImage: null,
      reportId: null,
      createdAt: null,
    });
    setErrors({});
    setTouched({});
  }, []);

  /**
   * Validate all fields and return validity.
   */
  const validateAll = useCallback(() => {
    const newErrors = validate(values);
    // Mark all fields as touched
    setTouched({
      image: true,
      roadName: true,
      description: true,
      roadType: true,
      severity: true,
      latitude: true,
      longitude: true,
      address: true,
    });
    return Object.keys(newErrors).length === 0;
  }, [validate, values]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    validate,
    validateAll,
    isValid,
    resetForm,
  };
}
