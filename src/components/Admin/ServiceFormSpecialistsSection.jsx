/**
 * ServiceFormSpecialistsSection.jsx — выбор мастеров для услуги
 */

import { useLanguage } from '../../hooks/useLanguage';

export default function ServiceFormSpecialistsSection({
  specialists,
  specialistIds,
  onToggle,
  touched,
  errors,
}) {
  const { t } = useLanguage();

  return (
    <>
      <div className="service-form__divider">
        <h4>{t('admin.services.form.specialists')}</h4>
        <p className="service-form__hint">
          {t('admin.services.form.specialistsHint')}
        </p>
      </div>

      <div className="service-form__field">
        {specialists.length === 0 ? (
          <p className="service-form__empty">
            {t('admin.services.form.noSpecialists')}
          </p>
        ) : (
          <div className="service-form__specialists-grid">
            {specialists.map((specialist) => {
              const isChecked = specialistIds.includes(specialist.id);
              return (
                <label
                  key={specialist.id}
                  className={`service-form__specialist-checkbox ${
                    isChecked ? 'service-form__specialist-checkbox--checked' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggle(specialist.id)}
                    className="service-form__checkbox-input"
                  />
                  <span className="service-form__specialist-name">
                    {specialist.fullName}
                  </span>
                  <span className="service-form__specialist-position">
                    {specialist.position}
                  </span>
                </label>
              );
            })}
          </div>
        )}
        {touched.specialistIds && errors.specialistIds && (
          <p className="input__message input__message--error">
            {t(errors.specialistIds)}
          </p>
        )}
        <span className="service-form__counter">
          {t('admin.services.form.specialistsCounter', {
            selected: specialistIds.length,
            total: specialists.length,
          })}
        </span>
      </div>
    </>
  );
}
