import { useMemo, useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { TextArea } from '../../../components/common/TextArea';
import { Button } from '../../../components/common/Button';
import { Alert } from '../../../components/common/Alert';
import { useFormValidation } from '../../../hooks/useFormValidation';

const validators = {
  name: [
    { rule: 'required', message: 'Full name is required' },
    { rule: 'minLength', value: 2, message: 'Name must be at least 2 characters' },
  ],
  email: [
    { rule: 'required', message: 'Email is required' },
    { rule: 'email', message: 'Please enter a valid email address' },
  ],
  phone: [
    { rule: 'required', message: 'Phone number is required' },
    { rule: 'phone', message: 'Please enter a valid phone number' },
  ],
  location: [{ rule: 'required', message: 'Location is required' }],
};

/**
 * PersonalInfoForm - Edit profile form with validation and success alert.
 *
 * @param {Object} props
 * @param {Object} props.profile - Initial profile values
 */
export default function PersonalInfoForm({ profile }) {
  const initialValues = useMemo(
    () => ({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      bio: profile.bio,
    }),
    [profile]
  );

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useFormValidation(validators);

  const [saved, setSaved] = useState(false);
  const seeded = useRef(false);

  // Seed initial values once on mount.
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    Object.entries(initialValues).forEach(([key, value]) => setFieldValue(key, value));
  }, [initialValues, setFieldValue]);

  const onSubmit = handleSubmit(() => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3500);
  });

  return (
    <Card bordered className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-secondary-900 dark:text-dark-100">
          Personal Information
        </h3>
        <p className="mt-0.5 text-sm text-secondary-500 dark:text-dark-400">
          Update your basic account details.
        </p>
      </div>

      {saved && (
        <div className="mb-4">
          <Alert
            variant="success"
            dismissible
            onDismiss={() => setSaved(false)}
            title="Profile updated"
          >
            Your personal information has been saved successfully.
          </Alert>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            type="text"
            name="name"
            leftIcon={User}
            value={values.name || ''}
            onChange={handleChange('name')}
            onBlur={handleBlur('name')}
            error={touched.name && errors.name}
            fullWidth
            autoComplete="name"
            required
          />
          <Input
            label="Email Address"
            type="email"
            name="email"
            leftIcon={Mail}
            value={values.email || ''}
            onChange={handleChange('email')}
            onBlur={handleBlur('email')}
            error={touched.email && errors.email}
            fullWidth
            autoComplete="email"
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            leftIcon={Phone}
            value={values.phone || ''}
            onChange={handleChange('phone')}
            onBlur={handleBlur('phone')}
            error={touched.phone && errors.phone}
            fullWidth
            autoComplete="tel"
            required
          />
          <Input
            label="Location"
            type="text"
            name="location"
            leftIcon={MapPin}
            value={values.location || ''}
            onChange={handleChange('location')}
            onBlur={handleBlur('location')}
            error={touched.location && errors.location}
            fullWidth
            autoComplete="address-level2"
            required
          />
          <div className="sm:col-span-2">
            <TextArea
              label="Bio"
              name="bio"
              rows={3}
              value={values.bio || ''}
              onChange={handleChange('bio')}
              onBlur={handleBlur('bio')}
              helperText="Tell the community a bit about yourself (optional)."
              fullWidth
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            leftIcon={Save}
            aria-label="Save personal information"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

