/**
 * SpecialistForm.jsx — форма добавления/редактирования специалиста
 */
import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import SpecialistFormServicesSection from './SpecialistFormServicesSection';
import {
  validateSpecialistField,
  prepareSpecialistForSave,
} from '../../utils/validateSpecialist';
import { VALIDATION_LIMITS } from '../../constants/validationLimits';
import { createPositiveIntegerChangeHandler } from '../../utils/serviceFormHelpers';
import { sanitizeInput } from '../../utils/sanitizers';
import { useLanguage } from '../../hooks/useLanguage';
import './SpecialistForm.css';

const INITIAL_SPECIALIST_FORM_DATA = {
  fullName: '',
  position: '',
  experience: '',
  serviceIds: [],
  fullNameEn: '',
  positionEn: '',
};

export default function SpecialistForm({
  mode = 'add',
  specialist = null,
  services = [],
  existingSpecialists = [],
  onSave,
  onCancel,
}) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState(INITIAL_SPECIALIST_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (mode === 'edit' && specialist) {
      setFormData({
        fullName: specialist.fullName || '',
        position: specialist.position || '',
        experience:
          specialist.experience !== undefined
            ? String(specialist.experience)
            : '',
        serviceIds: specialist.serviceIds || [],
        fullNameEn: specialist.fullNameEn || '',
        positionEn: specialist.positionEn || '',
      });
      setErrors({});
      setTouched({});
    }
  }, [mode, specialist]);

  const handleChange = (name, value) => {
    const safeValue = typeof value === 'string' ? sanitizeInput(value) : value;
    setFormData((prev) => ({ ...prev, [name]: safeValue }));
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateSpecialistField(
          name,
          value,
          existingSpecialists,
          specialist?.id,
        ),
      }));
    }
  };

  const handleServiceToggle = (serviceId) => {
    setFormData((prev) => {
      const newIds = prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId];
      return { ...prev, serviceIds: newIds };
    });
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateSpecialistField(
        name,
        formData[name],
        existingSpecialists,
        specialist?.id,
      ),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const prepared = prepareSpecialistForSave(
      formData,
      existingSpecialists,
      specialist?.id,
    );
    setErrors(prepared.errors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
    );

    if (!prepared.isValid) return;

    onSave(prepared.data);
  };

  const submitButtonText =
    mode === 'edit'
      ? t('admin.specialists.form.update')
      : t('admin.specialists.form.add');

  return (
    <form className="specialist-form" onSubmit={handleSubmit} noValidate>
      <Input
        label={t('admin.specialists.form.fullName')}
        name="fullName"
        value={formData.fullName}
        onChange={(e) => handleChange('fullName', e.target.value)}
        onBlur={() => handleBlur('fullName')}
        error={
          touched.fullName && errors.fullName ? t(errors.fullName) : null
        }
        placeholder={t('admin.specialists.form.fullNamePlaceholder')}
        maxLength={VALIDATION_LIMITS.SPECIALIST_NAME.maxLength}
        required
      />

      <Input
        label={t('admin.specialists.form.position')}
        name="position"
        value={formData.position}
        onChange={(e) => handleChange('position', e.target.value)}
        onBlur={() => handleBlur('position')}
        error={
          touched.position && errors.position ? t(errors.position) : null
        }
        placeholder={t('admin.specialists.form.positionPlaceholder')}
        maxLength={VALIDATION_LIMITS.SPECIALIST_POSITION.maxLength}
        required
      />

      <div className="specialist-form__row">
        <Input
          label={t('admin.specialists.form.experience')}
          name="experience"
          type="number"
          value={formData.experience}
          onChange={createPositiveIntegerChangeHandler(
            (value) => handleChange('experience', value),
            VALIDATION_LIMITS.EXPERIENCE.max,
          )}
          onBlur={() => handleBlur('experience')}
          error={
            touched.experience && errors.experience
              ? t(errors.experience)
              : null
          }
          placeholder="5"
          min={VALIDATION_LIMITS.EXPERIENCE.min}
          max={VALIDATION_LIMITS.EXPERIENCE.max}
          required
        />
      </div>

      <div className="specialist-form__divider">
        <h4>{t('admin.specialists.form.englishVersion')}</h4>
      </div>

      <Input
        label={t('admin.specialists.form.fullNameEn')}
        name="fullNameEn"
        value={formData.fullNameEn}
        onChange={(e) => handleChange('fullNameEn', e.target.value)}
        onBlur={() => handleBlur('fullNameEn')}
        error={
          touched.fullNameEn && errors.fullNameEn
            ? t(errors.fullNameEn)
            : null
        }
        placeholder={t('admin.specialists.form.fullNameEnPlaceholder')}
        maxLength={VALIDATION_LIMITS.SPECIALIST_NAME.maxLength}
      />

      <Input
        label={t('admin.specialists.form.positionEn')}
        name="positionEn"
        value={formData.positionEn}
        onChange={(e) => handleChange('positionEn', e.target.value)}
        onBlur={() => handleBlur('positionEn')}
        error={
          touched.positionEn && errors.positionEn
            ? t(errors.positionEn)
            : null
        }
        placeholder={t('admin.specialists.form.positionEnPlaceholder')}
        maxLength={VALIDATION_LIMITS.SPECIALIST_POSITION.maxLength}
      />

      <SpecialistFormServicesSection
        services={services}
        serviceIds={formData.serviceIds}
        onToggle={handleServiceToggle}
        touched={touched}
        errors={errors}
      />

      <div className="specialist-form__actions">
        <Button
          type="button"
          variant="outline"
          leftIcon={<X size={16} />}
          onClick={onCancel}
        >
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="primary" leftIcon={<Save size={16} />}>
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
}
