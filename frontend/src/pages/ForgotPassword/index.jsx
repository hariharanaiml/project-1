import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Shield, ArrowLeft } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Container from '../../components/common/Container';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { useFormValidation } from '../../hooks/useFormValidation';

const validators = {
  email: [
    { rule: 'required', message: 'Email is required' },
    { rule: 'email', message: 'Please enter a valid email address' },
  ],
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [alert, setAlert] = useState(null);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation(validators);

  const onSubmit = handleSubmit(() => {
    setSubmitted(true);
    setAlert({
      variant: 'success',
      title: 'Reset link sent',
      message:
        'If an account exists for this email, a password reset link has been sent.',
    });
  });

  return (
    <PageLayout>
      <Container className="section-padding">
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <div className="w-full max-w-md">
            <Card elevation="lg" padding="lg">
              {/* Shield + Brand Header */}
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/50 mb-4">
                  <Shield size={26} className="text-primary-600 dark:text-primary-400" aria-hidden="true" />
                </div>
                <h1 className="text-xl font-bold text-secondary-900 dark:text-dark-100">
                  Forgot Password
                </h1>
                <p className="mt-1.5 text-sm text-secondary-600 dark:text-dark-400">
                  Enter your email address and we&apos;ll send a password reset link.
                </p>
              </div>

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

              {/* Form */}
              {!submitted && (
                <form onSubmit={onSubmit} noValidate>
                  <div className="space-y-4">
                    <Input
                      label="Email Address"
                      type="email"
                      id="forgot-email"
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
                  </div>

                  <div className="mt-6">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      size="lg"
                    >
                      Send Reset Link
                    </Button>
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => navigate('/login')}
                      leftIcon={ArrowLeft}
                    >
                      Back to Login
                    </Button>
                  </div>
                </form>
              )}

              {/* Submitted / Success State */}
              {submitted && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => navigate('/login')}
                    leftIcon={ArrowLeft}
                  >
                    Back to Login
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </Container>
    </PageLayout>
  );
}

