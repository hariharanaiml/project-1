import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Container from '../../components/common/Container';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Divider } from '../../components/common/Divider';
import { Alert } from '../../components/common/Alert';
import { Checkbox } from '../../components/common/Checkbox';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useAuth } from '../../context/AuthContext';
import { isAdmin } from '../../services/authService';

const roles = [
  { value: '', label: 'Select a role', disabled: true },
  { value: 'citizen', label: 'Citizen' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'admin', label: 'Administrator' },
];

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
  fullName: [
    { rule: 'required', message: 'Full name is required' },
    { rule: 'minLength', value: 2, message: 'Name must be at least 2 characters' },
    { rule: 'maxLength', value: 100, message: 'Name must be at most 100 characters' },
  ],
  email: [
    { rule: 'required', message: 'Email is required' },
    { rule: 'email', message: 'Please enter a valid email address' },
  ],
  phone: [
    { rule: 'required', message: 'Phone number is required' },
    { rule: 'phone', message: 'Please enter a valid phone number' },
  ],
  password: [
    { rule: 'required', message: 'Password is required' },
    { rule: 'minLength', value: 8, message: 'Password must be at least 8 characters' },
    { rule: 'maxLength', value: 128, message: 'Password must be at most 128 characters' },
  ],
  confirmPassword: [
    { rule: 'required', message: 'Please confirm your password' },
    { rule: 'match', value: 'password', message: 'Passwords do not match' },
  ],
  role: [
    { rule: 'required', message: 'Please select a role' },
  ],
};

const strengthColors = {
  Weak: 'bg-danger-500',
  Medium: 'bg-warning-500',
  Strong: 'bg-success-500',
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation(validators);

  const passwordStrength = useMemo(
    () => getPasswordStrength(values.password || ''),
    [values.password]
  );

  const onSubmit = handleSubmit(async (formValues) => {
    setLoading(true);
    setAlert(null);

    try {
      const session = await register({
        fullName: formValues.fullName,
        email: formValues.email,
        phone: formValues.phone,
        password: formValues.password,
        role: formValues.role,
      });

      setAlert({
        variant: 'success',
        title: 'Account created',
        message: `Welcome, ${formValues.fullName}! Redirecting to dashboard...`,
      });

      setTimeout(() => {
        navigate(isAdmin(session.user) ? '/admin' : '/dashboard');
      }, 800);
    } catch (err) {
      setLoading(false);
      setAlert({
        variant: 'danger',
        title: 'Registration failed',
        message: err.message || 'Please check your details and try again.',
      });
    }
  });

  const PasswordIcon = showPassword ? EyeOff : Eye;
  const ConfirmPasswordIcon = showConfirmPassword ? EyeOff : Eye;

  return (
    <PageLayout>
      <Container className="section-padding">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-dark-100">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-secondary-600 dark:text-dark-400">
              Join RoadSense AI and help build smarter infrastructure
            </p>
          </div>

          <Card elevation="md" padding="lg">
            {alert && (
              <div className="mb-4">
                <Alert
                  variant={alert.variant}
                  dismissible
                  onDismiss={() => setAlert(null)}
                  title={alert.title}
                >
                  {alert.message}
                </Alert>
              </div>
            )}

            <form onSubmit={onSubmit} noValidate>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  type="text"
                  id="register-name"
                  name="fullName"
                  placeholder="John Doe"
                  value={values.fullName || ''}
                  onChange={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  error={touched.fullName && errors.fullName}
                  leftIcon={User}
                  autoComplete="name"
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  id="register-email"
                  name="email"
                  placeholder="you@example.com"
                  value={values.email || ''}
                  onChange={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && errors.email}
                  leftIcon={Mail}
                  autoComplete="email"
                  required
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  id="register-phone"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  value={values.phone || ''}
                  onChange={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  error={touched.phone && errors.phone}
                  leftIcon={Phone}
                  autoComplete="tel"
                  required
                />

                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="register-password"
                  name="password"
                  placeholder="Create a strong password"
                  value={values.password || ''}
                  onChange={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={touched.password && errors.password}
                  leftIcon={Lock}
                  rightIcon={PasswordIcon}
                  onRightIconClick={() => setShowPassword((prev) => !prev)}
                  rightIconAriaLabel={showPassword ? 'Hide password' : 'Show password'}
                  autoComplete="new-password"
                  required
                />

                {values.password && passwordStrength.label && (
                  <div className="mt-1">
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
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="register-confirm-password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={values.confirmPassword || ''}
                  onChange={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  error={touched.confirmPassword && errors.confirmPassword}
                  leftIcon={Lock}
                  rightIcon={ConfirmPasswordIcon}
                  onRightIconClick={() => setShowConfirmPassword((prev) => !prev)}
                  rightIconAriaLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                  autoComplete="new-password"
                  required
                />

                <Select
                  label="Role"
                  id="register-role"
                  name="role"
                  value={values.role || ''}
                  onChange={handleChange('role')}
                  onBlur={handleBlur('role')}
                  error={touched.role && errors.role}
                  options={roles}
                  placeholder="Select a role"
                  required
                />

                <div className="pt-2">
                  <Checkbox
                    label="I agree to the Terms & Conditions and Privacy Policy"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  loading={loading}
                  disabled={!agreeTerms}
                  rightIcon={ArrowRight}
                >
                  Create Account
                </Button>
              </div>
            </form>

            <Divider className="my-6" label="Already have an account?" />

            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </Card>
        </div>
      </Container>
    </PageLayout>
  );
}
