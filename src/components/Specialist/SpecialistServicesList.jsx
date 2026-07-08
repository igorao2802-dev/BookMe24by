/**
 * SpecialistServicesList.jsx — перечень услуг мастера в кабинете
 */

import { Scissors } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { formatPrice, formatDuration } from '../../utils/formatters';
import EmptyState from '../UI/EmptyState';
import './SpecialistServicesList.css';

export default function SpecialistServicesList({ services = [] }) {
  const { t } = useLanguage();

  if (services.length === 0) {
    return (
      <EmptyState
        icon={<Scissors size={40} />}
        title={t('specialist.servicesEmptyTitle')}
        description={t('specialist.servicesEmptyDescription')}
        variant="info"
      />
    );
  }

  return (
    <ul className="specialist-services-list">
      {services.map((service) => (
        <li key={service.id} className="specialist-services-list__item">
          <div className="specialist-services-list__main">
            <span className="specialist-services-list__name">{service.name}</span>
            {service.category && (
              <span className="specialist-services-list__category">
                {t(`catalog.categories.${service.category}`)}
              </span>
            )}
          </div>
          <div className="specialist-services-list__meta">
            <span>{formatDuration(service.duration, t)}</span>
            <span className="specialist-services-list__price">
              {formatPrice(service.price)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
