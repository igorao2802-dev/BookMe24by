/**
 * SpecialistSelector.jsx — Шаг 2: выбор специалиста
 * 
 * ПОЧЕМУ фильтрация по specialistIds услуги?
 * Фильтрация идёт по specialistIds услуги (обратная проверка),
 * а не по serviceIds специалиста. Это гарантирует корректную работу
 * даже если serviceIds у стандартных специалистов не обновлены.
 * 
 * ПОЧЕМУ это важно?
 * - При создании услуги администратор назначает specialistIds
 * - Но serviceIds у стандартных специалистов (из JSON) не обновляются
 * - Поэтому фильтрация по spec.serviceIds даёт пустой результат
 */
import { useMemo } from 'react';
import { Award, Star, Check } from 'lucide-react';
import EmptyState from '../UI/EmptyState';
import { useLanguage } from '../../hooks/useLanguage';
import './SpecialistSelector.css';

export default function SpecialistSelector({
  specialists,
  services = [],
  selectedServiceId,
  selectedSpecialistId,
  onSelect,
}) {
  const { t } = useLanguage();

  // ПОЧЕМУ useMemo для availableSpecialists?
  // Список пересчитывается только при смене услуги или данных специалистов.
  const availableSpecialists = useMemo(() => {
    if (!selectedServiceId) return [];

    const service = services.find((s) => s.id === selectedServiceId);

    if (!service || !service.specialistIds || service.specialistIds.length === 0) {
      return specialists;
    }

    return specialists.filter((spec) =>
      service.specialistIds.includes(spec.id)
    );
  }, [specialists, selectedServiceId, services]);

  if (availableSpecialists.length === 0) {
    return (
      <EmptyState
        title={t('booking.validation.selectSpecialist') || 'Нет доступных специалистов'}
        description="К сожалению, на эту услугу сейчас нет свободных мастеров"
        variant="info"
      />
    );
  }

  const handleSpecialistClick = (specialistId) => {
    if (selectedSpecialistId === specialistId) {
      onSelect(null);
    } else {
      onSelect(specialistId);
    }
  };

  return (
    <div className="specialist-selector">
      <div className="specialist-selector__header">
        <h2>{t('booking.steps.specialist')}</h2>
        <p className="specialist-selector__description">
          {t('catalog.specialist.services')}: {availableSpecialists.length}
        </p>
      </div>

      <div className="specialist-selector__grid">
        {availableSpecialists.map((specialist) => {
          const isSelected = selectedSpecialistId === specialist.id;
          return (
            <article
              key={specialist.id}
              className={`specialist-card ${
                isSelected ? 'specialist-card--selected' : ''
              }`}
              onClick={() => handleSpecialistClick(specialist.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSpecialistClick(specialist.id);
                }
              }}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <div className="specialist-card__check">
                  <Check size={20} />
                </div>
              )}

              <div className="specialist-card__avatar">
                {specialist.fullName.split(' ').map((n) => n[0]).join('')}
              </div>

              <h3 className="specialist-card__name">{specialist.fullName}</h3>
              <p className="specialist-card__position">{specialist.position}</p>

              <div className="specialist-card__meta">
                <span className="specialist-card__meta-item">
                  <Award size={14} />
                  {t('catalog.specialist.experience', { years: specialist.experience })}
                </span>
                <span className="specialist-card__meta-item">
                  <Star size={14} />
                  {specialist.rating}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
