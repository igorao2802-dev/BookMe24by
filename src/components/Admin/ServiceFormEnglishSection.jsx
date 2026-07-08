/**
 * ServiceFormEnglishSection.jsx — необязательные поля EN-версии услуги
 */

import Input from '../UI/Input';
import { FIELD_LIMITS } from '../../utils/constants';
import { useLanguage } from '../../hooks/useLanguage';

export default function ServiceFormEnglishSection({
  formData,
  touched,
  errors,
  onChange,
  onBlur,
}) {
  const { t } = useLanguage();

  return (
    <>
      <div className="service-form__divider">
        <h4>{t('admin.services.form.englishVersion')}</h4>
      </div>

      <Input
        label={t('admin.services.form.nameEn')}
        name="nameEn"
        value={formData.nameEn}
        onChange={(e) => onChange('nameEn', e.target.value)}
        onBlur={() => onBlur('nameEn')}
        error={touched.nameEn && errors.nameEn ? t(errors.nameEn) : null}
        placeholder={t('admin.services.form.nameEnPlaceholder')}
        maxLength={100}
      />

      <div className="service-form__field">
        <label className="input__label" htmlFor="service-description-en">
          {t('admin.services.form.descriptionEn')}
        </label>
        <textarea
          id="service-description-en"
          name="descriptionEn"
          value={formData.descriptionEn}
          onChange={(e) => onChange('descriptionEn', e.target.value)}
          onBlur={() => onBlur('descriptionEn')}
          placeholder={t('admin.services.form.descriptionEnPlaceholder')}
          maxLength={FIELD_LIMITS.COMMENT_MAX_LENGTH}
          rows={3}
          className={`input__field input__field--textarea ${
            touched.descriptionEn && errors.descriptionEn
              ? 'input__field--error'
              : ''
          }`}
        />
        {touched.descriptionEn && errors.descriptionEn && (
          <p className="input__message input__message--error">
            {t(errors.descriptionEn)}
          </p>
        )}
      </div>
    </>
  );
}
