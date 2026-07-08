/**
 * ServiceForm.jsx — форма добавления/редактирования услуги
 */
import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Button from '../UI/Button';
import ServiceFormSpecialistsSection from './ServiceFormSpecialistsSection';
import ServiceFormEnglishSection from './ServiceFormEnglishSection';
import { SERVICE_CATEGORIES, PRICE_LIMITS } from '../../utils/constants';
import { VALIDATION_LIMITS } from '../../constants/validationLimits';
import {
  validateServiceField,
  prepareServiceForSave,
} from '../../utils/validateService';
import {
  blockDecimalKeypress,
  createPriceChangeHandler,
  createPositiveIntegerChangeHandler,
  INITIAL_SERVICE_FORM_DATA,
} from '../../utils/serviceFormHelpers';
import { sanitizeInput } from '../../utils/sanitizers';
import { useLanguage } from '../../hooks/useLanguage';
import './ServiceForm.css';

export default function ServiceForm({
  mode = 'add',
  service = null,
  specialists = [],
  existingServices = [],
  onSave,
  onCancel,
}) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState(INITIAL_SERVICE_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (mode === 'edit' && service) {
      setFormData({
        name: service.name || '',
        category: service.category || '',
        description: service.description || '',
        duration: service.duration !== undefined ? String(service.duration) : '',
        price: service.price !== undefined ? String(service.price) : '',
        specialistIds: service.specialistIds || [],
        nameEn: service.nameEn || '',
        descriptionEn: service.descriptionEn || '',
      });
      setErrors({});
      setTouched({});
    }
  }, [mode, service]);

  const categoryOptions = [
    { value: '', label: t('admin.services.form.selectCategory') },
    ...Object.values(SERVICE_CATEGORIES).map((cat) => ({
      value: cat,
      label: t(`catalog.categories.${cat}`),
    })),
  ];

  const handleChange = (name, value) => {
    const safeValue = typeof value === 'string' ? sanitizeInput(value) : value;
    setFormData((prev) => ({ ...prev, [name]: safeValue }));
    if (touched[name]) {
      const errorKey = validateServiceField(
        name,
        value,
        existingServices,
        service?.id,
      );
      setErrors((prev) => ({ ...prev, [name]: errorKey }));
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorKey = validateServiceField(
      name,
      formData[name],
      existingServices,
      service?.id,
    );
    setErrors((prev) => ({ ...prev, [name]: errorKey }));
  };

  const handleSpecialistToggle = (specialistId) => {
    setFormData((prev) => {
      const newSpecialistIds = prev.specialistIds.includes(specialistId)
        ? prev.specialistIds.filter((id) => id !== specialistId)
        : [...prev.specialistIds, specialistId];
      return { ...prev, specialistIds: newSpecialistIds };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const prepared = prepareServiceForSave(
      formData,
      existingServices,
      service?.id,
    );
    setErrors(prepared.errors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {}),
    );

    if (!prepared.isValid) {
      return;
    }

    return onSave(prepared.data);
  };

  const isEditMode = mode === 'edit';
  const submitButtonText = isEditMode
    ? t('admin.services.form.update')
    : t('admin.services.form.add');

  return (
    <form className="service-form" onSubmit={handleSubmit} noValidate>
      <Input
        label={t('admin.services.form.name')}
        name="name"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        onBlur={() => handleBlur('name')}
        error={touched.name && errors.name ? t(errors.name) : null}
        placeholder={t('admin.services.form.namePlaceholder')}
        maxLength={VALIDATION_LIMITS.SERVICE_NAME.maxLength}
        required
      />

      <Select
        label={t('admin.services.form.category')}
        name="category"
        value={formData.category}
        onChange={(e) => handleChange('category', e.target.value)}
        onBlur={() => handleBlur('category')}
        error={touched.category && errors.category ? t(errors.category) : null}
        options={categoryOptions}
        required
      />

      <div className="service-form__field">
        <label className="input__label" htmlFor="service-description">
          {t('admin.services.form.description')}
          <span className="input__required">*</span>
        </label>
        <textarea
          id="service-description"
          name="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          placeholder={t('admin.services.form.descriptionPlaceholder')}
          maxLength={VALIDATION_LIMITS.SERVICE_DESCRIPTION.maxLength}
          rows={4}
          className={`input__field input__field--textarea ${
            touched.description && errors.description ? 'input__field--error' : ''
          }`}
          required
        />
        {touched.description && errors.description ? (
          <p className="input__message input__message--error">
            {t(errors.description)}
          </p>
        ) : (
          <p className="input__message input__message--helper">
            {t('admin.services.form.descriptionHelper', {
              max: VALIDATION_LIMITS.SERVICE_DESCRIPTION.maxLength,
            })}
          </p>
        )}
        <span className="service-form__counter">
          {formData.description.length} / {VALIDATION_LIMITS.SERVICE_DESCRIPTION.maxLength}
        </span>
      </div>

      <div className="service-form__row">
        <Input
          label={t('admin.services.form.duration')}
          name="duration"
          type="number"
          value={formData.duration}
          onChange={createPositiveIntegerChangeHandler(
            (value) => handleChange('duration', value),
            VALIDATION_LIMITS.DURATION.max,
          )}
          onBlur={() => handleBlur('duration')}
          error={touched.duration && errors.duration ? t(errors.duration) : null}
          placeholder="60"
          min={VALIDATION_LIMITS.DURATION.serviceMin}
          max={VALIDATION_LIMITS.DURATION.max}
          step={1}
          onKeyPress={blockDecimalKeypress}
          required
        />

        <Input
          label={t('admin.services.form.price')}
          name="price"
          type="number"
          value={formData.price}
          onChange={createPriceChangeHandler(
            (value) => handleChange('price', value),
            PRICE_LIMITS.ABSOLUTE_MAX,
          )}
          onBlur={() => handleBlur('price')}
          onKeyPress={blockDecimalKeypress}
          error={touched.price && errors.price ? t(errors.price) : null}
          placeholder="45"
          min={PRICE_LIMITS.MIN}
          max={PRICE_LIMITS.ABSOLUTE_MAX}
          step={PRICE_LIMITS.STEP}
          helperText={t('admin.services.form.priceHelper', {
            max: PRICE_LIMITS.ABSOLUTE_MAX,
          })}
          required
        />
      </div>

      <ServiceFormSpecialistsSection
        specialists={specialists}
        specialistIds={formData.specialistIds}
        onToggle={handleSpecialistToggle}
        touched={touched}
        errors={errors}
      />

      <ServiceFormEnglishSection
        formData={formData}
        touched={touched}
        errors={errors}
        onChange={handleChange}
        onBlur={handleBlur}
      />

      <div className="service-form__actions">
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
