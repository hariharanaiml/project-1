import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Shield,
  CheckCircle2,
  Activity,
  BarChart3,
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Container from '../../components/common/Container';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Checkbox } from '../../components/common/Checkbox';
import { Divider } from '../../components/common/Divider';
import { Alert } from '../../components/common/Alert';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useAuth } from '../../context/AuthContext';
import { isAdmin } from '../../services/authService';

const validators = {
  email: [
    { rule: 'required', message: 'Email is required' },
    { rule: 'email', message: 'Please enter a valid email address' },
  ],
  password: [
    { rule: 'required', message: 'Password is required' },
    { rule: 'minLength', value: 8, message: 'Password must be at least 8 characters' },
  ],
};

const features = [
  {
    icon: CheckCircle2,
    text: 'AI Road Damage Detection',
  },
  {
    icon: Activity,
    text: 'Live Infrastructure Monitoring',
  },
  {
    icon: BarChart3,
    text: 'Smart Analytics Dashboard',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation(validators);

  const onSubmit = handleSubmit(async () => {
    setLoading(true);
    setAlert(null);

    try {
      const session = await login({ email: values.email, password: values.password });
      setAlert({
        variant: 'success',
        title: 'Login successful',
        message: 'Welcome back! Redirecting to dashboard...',
      });

      setTimeout(() => {
        navigate(isAdmin(session.user) ? '/admin' : '/dashboard');
      }, 800);
    } catch (err) {
      setLoading(false);
      setAlert({
        variant: 'danger',
        title: 'Login failed',
        message: err.message || 'Please check your credentials and try again.',
      });
    }
  });

  const PasswordIcon = showPassword ? EyeOff : Eye;

  return (
    <PageLayout>
      <Container className="section-padding">
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <Card elevation="lg" padding="none" className="w-full max-w-4xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* ── Left Panel: Brand ── */}
              <div className="hidden md:flex md:w-[40%] bg-primary-500 dark:bg-primary-600 p-8 lg:p-10 flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
                      <Shield size={22} className="text-white" aria-hidden="true" />
                    </div>
                    <span className="text-lg font-bold text-white">RoadSense AI</span>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2">
                    AI-Powered Infrastructure Monitoring
                  </h2>
                  <p className="text-sm text-white/80 leading-relaxed">
                    AI-powered smart infrastructure monitoring platform for detecting,
                    analyzing, and managing road damage using computer vision and predictive
                    analytics.
                  </p>
                </div>

                <div className="mt-8 space-y-3">
                  {features.map((feature) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <div key={feature.text} className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm shrink-0">
                          <FeatureIcon size={16} className="text-white" aria-hidden="true" />
                        </div>
                        <span className="text-sm font-medium text-white/90">
                          {feature.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-8 text-xs text-white/50">
                  &copy; {new Date().getFullYear()} RoadSense AI. All rights reserved.
                </p>
              </div>

              {/* ── Right Panel: Form ── */}
              <div className="w-full md:w-[60%] p-6 sm:p-8 lg:p-10">
                {/* Alert */}
                {alert && (
                  <div className="mb-6">
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

                {/* Brand heading visible only on mobile/tablet */}
                <div className="flex items-center gap-3 mb-8 md:hidden">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/50">
                    <Shield size={22} className="text-primary-600 dark:text-primary-400" aria-hidden="true" />
                  </div>
                  <span className="text-lg font-bold text-secondary-900 dark:text-dark-100">
                    RoadSense AI
                  </span>
                </div>

                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-secondary-900 dark:text-dark-100">
                    Welcome Back
                  </h1>
                  <p className="mt-1.5 text-sm text-secondary-600 dark:text-dark-400">
                    Log in to continue to RoadSense AI
                  </p>
                </div>

                <form onSubmit={onSubmit} noValidate>
                  <div className="space-y-4">
                    <Input
                      label="Email Address"
                      type="email"
                      id="login-email"
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
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      name="password"
                      placeholder="Enter your password"
                      value={values.password || ''}
                      onChange={handleChange('password')}
                      onBlur={handleBlur('password')}
                      error={touched.password && errors.password}
                      leftIcon={Lock}
                      rightIcon={PasswordIcon}
                      onRightIconClick={() => setShowPassword((prev) => !prev)}
                      rightIconAriaLabel={showPassword ? 'Hide password' : 'Show password'}
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <Checkbox
                      label="Remember me"
                      checked={values.rememberMe || false}
                      onChange={handleChange('rememberMe')}
                    />
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="mt-6">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      size="lg"
                      loading={loading}
                      leftIcon={LogIn}
                    >
                      Log In
                    </Button>
                  </div>
                </form>

                <Divider className="my-6" label="or" />

                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => navigate('/register')}
                >
                  Create an Account
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </PageLayout>
  );
}

