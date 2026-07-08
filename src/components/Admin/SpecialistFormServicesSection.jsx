/**
 * SpecialistFormServicesSection.jsx — выбор услуг для специалиста
 */

import { useLanguage } from '../../hooks/useLanguage';

export default function SpecialistFormServicesSection({
  services,
  serviceIds,
  onToggle,
  touched,
  errors,
}) {
  const { t } = useLanguage();

  return (
    <div className="specialist-form__field">
      <label className="input__label">
        {t('admin.specialists.form.services')}
        <span className="input__required">*</span>
      </label>
      <p className="specialist-form__hint">
        {t('admin.specialists.form.servicesHint')}
      </p>

      {services.length === 0 ? (
        <p className="specialist-form__empty">
          {t('admin.specialists.form.noServices')}
        </p>
      ) : (
        <div className="specialist-form__services-grid">
          {services.map((service) => {
            const isChecked = serviceIds.includes(service.id);
            return (
              <label
                key={service.id}
                className={`specialist-form__service-checkbox ${
                  isChecked ? 'specialist-form__service-checkbox--checked' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(service.id)}
                  className="specialist-form__checkbox-input"
                />
                <span className="specialist-form__service-name">
                  {service.name}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {touched.serviceIds && errors.serviceIds && (
        <p className="input__message input__message--error">
          {t(errors.serviceIds)}
        </p>
      )}
      <span className="specialist-form__counter">
        {t('admin.specialists.form.servicesCounter', {
          selected: serviceIds.length,
          total: services.length,
        })}
      </span>
    </div>
  );
}
