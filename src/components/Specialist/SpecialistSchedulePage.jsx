/**
 * SpecialistSchedulePage.jsx — заглушка расписания мастера (роль specialist)
 *
 * АРХИТЕКТУРНАЯ РОЛЬ:
 * Базовый защищённый маршрут /specialist для Фазы 3.
 * Полный функционал (фильтр записей по specialistId) — в следующих итерациях.
 */

import { CalendarClock } from 'lucide-react';

import EmptyState from '../UI/EmptyState';
import { useLanguage } from '../../hooks/useLanguage';

export default function SpecialistSchedulePage() {
  const { t } = useLanguage();

  return (
    <EmptyState
      icon={<CalendarClock size={48} />}
      title={t('specialist.scheduleTitle')}
      description={t('specialist.schedulePlaceholder')}
      variant="info"
    />
  );
}
