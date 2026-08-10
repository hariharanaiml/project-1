import { useState, useCallback } from 'react';

/**
 * Custom hook for form validation.
 *
 * @param {Object} validators - Object mapping field names to validation rule arrays.
 *   Each rule: { rule: 'required'|'email'|'minLength'|'maxLength'|'match', value?: *, message: string }
 * @returns {Object} { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, setFieldError, resetForm, isValid }
 */
export function useFormValidation(validators = {}) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback(
    (fieldName, fieldValue) => {
      const fieldValidators = validators[fieldName];
      if (!fieldValidators) return '';

      for (const validator of fieldValidators) {
        const { rule, value: ruleValue, message } = validator;

        switch (rule) {
          case 'required':
            if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
              return message || `${fieldName} is required`;
            }
            break;

          case 'email': {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (fieldValue && !emailRegex.test(fieldValue)) {
              return message || 'Please enter a valid email address';
            }
            break;
          }

          case 'minLength':
            if (fieldValue && fieldValue.length < ruleValue) {
              return message || `Must be at least ${ruleValue} characters`;
            }
            break;

          case 'maxLength':
            if (fieldValue && fieldValue.length > ruleValue) {
              return message || `Must be at most ${ruleValue} characters`;
            }
            break;

          case 'match':
            if (fieldValue !== values[ruleValue]) {
              return message || `Must match ${ruleValue}`;
            }
            break;

          case 'pattern': {
            const pattern = ruleValue instanceof RegExp ? ruleValue : new RegExp(ruleValue);
            if (fieldValue && !pattern.test(fieldValue)) {
              return message || 'Invalid format';
            }
            break;
          }

          case 'phone': {
            const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
            if (fieldValue && !phoneRegex.test(fieldValue)) {
              return message || 'Please enter a valid phone number';
            }
            break;
          }

          default:
            break;
        }
      }
      return '';
    },
    [values, validators]
  );

  const validateAllFields = useCallback(
    (formValues) => {
      const newErrors = {};
      let formIsValid = true;

      for (const fieldName of Object.keys(validators)) {
        const error = validateField(fieldName, formValues[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
          formIsValid = false;
        }
      }

      return { errors: newErrors, isValid: formIsValid };
    },
    [validateField, validators]
  );

  const handleChange = useCallback(
    (fieldName) => (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setValues((prev) => ({ ...prev, [fieldName]: value }));

      // Validate on change if field was already touched
      if (touched[fieldName]) {
        const error = validateField(fieldName, value);
        setErrors((prev) => {
          const next = { ...prev };
          if (error) {
            next[fieldName] = error;
          } else {
            delete next[fieldName];
          }
          return next;
        });
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (fieldName) => () => {
      setTouched((prev) => ({ ...prev, [fieldName]: true }));
      const error = validateField(fieldName, values[fieldName]);
      setErrors((prev) => {
        const next = { ...prev };
        if (error) {
          next[fieldName] = error;
        } else {
          delete next[fieldName];
        }
        return next;
      });
    },
    [validateField, values]
  );

  const handleSubmit = useCallback(
    (onSubmit) => (e) => {
      e.preventDefault();

      // Mark all fields as touched
      const allTouched = {};
      for (const fieldName of Object.keys(validators)) {
        allTouched[fieldName] = true;
      }
      setTouched(allTouched);

      // Validate all fields
      const { errors: validationErrors, isValid: formIsValid } = validateAllFields(values);
      setErrors(validationErrors);

      if (formIsValid && onSubmit) {
        onSubmit(values);
      }
    },
    [validateAllFields, values, validators]
  );

  const setFieldValue = useCallback((fieldName, value) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  const setFieldError = useCallback((fieldName, error) => {
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  }, []);

  const resetForm = useCallback(() => {
    setValues({});
    setErrors({});
    setTouched({});
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
    isValid,
  };
}

