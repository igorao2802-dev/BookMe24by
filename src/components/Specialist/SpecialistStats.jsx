/**
 * SpecialistStats.jsx — KPI-дашборд мастера
 */

import { Calendar, CheckCircle, Star, Wallet } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { useLanguage } from '../../hooks/useLanguage';
import './SpecialistStats.css';

export default function SpecialistStats({ stats }) {
  const { t } = useLanguage();

  const statsCards = [
    {
      label: t('specialist.stats.total'),
      value: stats.total,
      icon: <Calendar size={24} />,
      variant: 'default',
    },
    {
      label: t('specialist.stats.confirmed'),
      value: stats.confirmed,
      icon: <CheckCircle size={24} />,
      variant: 'success',
    },
    {
      label: t('specialist.stats.rating'),
      value: stats.rating.toFixed(1),
      icon: <Star size={24} />,
      variant: 'highlight',
    },
    {
      label: t('specialist.stats.revenue'),
      value: formatPrice(stats.revenue),
      icon: <Wallet size={24} />,
      variant: 'accent',
    },
  ];

  return (
    <div className="specialist-stats">
      {statsCards.map((card) => (
        <div
          key={card.label}
          className={`specialist-stats__card specialist-stats__card--${card.variant}`}
        >
          <div className="specialist-stats__icon">{card.icon}</div>
          <div className="specialist-stats__content">
            <span className="specialist-stats__label">{card.label}</span>
            <strong className="specialist-stats__value">{card.value}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}
