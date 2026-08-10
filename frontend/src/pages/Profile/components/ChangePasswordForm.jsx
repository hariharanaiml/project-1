import { useState, useMemo } from 'react';
import { Lock, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/common/Alert';
import { useFormValidation } from '../../../hooks/useFormValidation';

const uppercaseRegex = /[A-Z]/;
const lowercaseRegex = /[a-z]/;
const numberRegex = /[0-9]/;
const specialCharRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '' };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (uppercaseRegex.test(password)) score += 1;
  if (lowercaseRegex.test(password)) score += 1;
  if (numberRegex.test(password)) score += 1;
  if (specialCharRegex.test(password)) score += 1;

  if (score <= 2) return { score, label: 'Weak' };
  if (score <= 3) return { score, label: 'Medium' };
  return { score, label: 'Strong' };
}

const validators = {
  currentPassword: [{ rule: 'required', message: 'Current password is required' }],
  newPassword: [
    { rule: 'required', message: 'New password is required' },
    { rule: 'minLength', value: 8, message: 'Password must be at least 8 characters' },
  ],
  confirmPassword: [
    { rule: 'required', message: 'Please confirm your new password' },
    { rule: 'match', value: 'newPassword', message: 'Passwords do not match' },
  ],
};

const strengthColors = {
  Weak: 'bg-danger-500',
  Medium: 'bg-warning-500',
  Strong: 'bg-success-500',
};

/**
 * ChangePasswordForm - Change password form with show/hide toggles and strength meter.
 */
export default function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useFormValidation(validators);

  const passwordStrength = useMemo(
    () => getPasswordStrength(values.newPassword || ''),
    [values.newPassword]
  );

  const onSubmit = handleSubmit(() => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3500);
    resetForm();
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  });

  return (
    <Card bordered className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-secondary-900 dark:text-dark-100">
          Change Password
        </h3>
        <p className="mt-0.5 text-sm text-secondary-500 dark:text-dark-400">
          Keep your account secure with a strong, unique password.
        </p>
      </div>

      {saved && (
        <div className="mb-4">
          <Alert
            variant="success"
            dismissible
            onDismiss={() => setSaved(false)}
            title="Password changed"
          >
            Your password has been updated successfully.
          </Alert>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <div className="space-y-4">
          <Input
            label="Current Password"
            type={showCurrent ? 'text' : 'password'}
            name="currentPassword"
            leftIcon={Lock}
            rightIcon={showCurrent ? EyeOff : Eye}
            onRightIconClick={() => setShowCurrent((prev) => !prev)}
            rightIconAriaLabel={showCurrent ? 'Hide current password' : 'Show current password'}
            value={values.currentPassword || ''}
            onChange={handleChange('currentPassword')}
            onBlur={handleBlur('currentPassword')}
            error={touched.currentPassword && errors.currentPassword}
            fullWidth
            autoComplete="current-password"
            required
          />

          <Input
            label="New Password"
            type={showNew ? 'text' : 'password'}
            name="newPassword"
            leftIcon={KeyRound}
            rightIcon={showNew ? EyeOff : Eye}
            onRightIconClick={() => setShowNew((prev) => !prev)}
            rightIconAriaLabel={showNew ? 'Hide new password' : 'Show new password'}
            value={values.newPassword || ''}
            onChange={handleChange('newPassword')}
            onBlur={handleBlur('newPassword')}
            error={touched.newPassword && errors.newPassword}
            fullWidth
            autoComplete="new-password"
            required
          />

          {values.newPassword && passwordStrength.label && (
            <div>
              <div className="flex gap-1 mb-1">
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      level <= passwordStrength.score
                        ? strengthColors[passwordStrength.label]
                        : 'bg-secondary-200 dark:bg-dark-700'
                    }`}
                  />
                ))}
              </div>
              <p
                className={`text-xs font-medium ${
                  passwordStrength.label === 'Weak'
                    ? 'text-danger-500'
                    : passwordStrength.label === 'Medium'
                    ? 'text-warning-500'
                    : 'text-success-500'
                }`}
              >
                {passwordStrength.label}
              </p>
            </div>
          )}

          <Input
            label="Confirm New Password"
            type={showConfirm ? 'text' : 'password'}
            name="confirmPassword"
            leftIcon={Lock}
            rightIcon={showConfirm ? EyeOff : Eye}
            onRightIconClick={() => setShowConfirm((prev) => !prev)}
            rightIconAriaLabel={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            value={values.confirmPassword || ''}
            onChange={handleChange('confirmPassword')}
            onBlur={handleBlur('confirmPassword')}
            error={touched.confirmPassword && errors.confirmPassword}
            fullWidth
            autoComplete="new-password"
            required
          />
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            leftIcon={CheckCircle2}
            aria-label="Update password"
          >
            Update Password
          </Button>
        </div>
      </form>
    </Card>
  );
}

