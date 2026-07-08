/**
 * SpecialistSchedulePage.jsx — расписание записей мастера
 */

import { useMemo } from 'react';
import { CalendarClock } from 'lucide-react';

import EmptyState from '../UI/EmptyState';
import HistoryCard from '../Profile/HistoryCard';
import { useLanguage } from '../../hooks/useLanguage';
import { useCurrentSpecialistContext } from '../../contexts/CurrentSpecialistContext';
import './SpecialistSchedulePage.css';

export default function SpecialistSchedulePage({
  bookings,
  services,
}) {
  const { t } = useLanguage();
  const { currentSpecialist, currentSpecialistId } =
    useCurrentSpecialistContext();

  const specialistBookings = useMemo(() => {
    if (!currentSpecialistId) return [];
    return bookings
      .filter(
        (booking) =>
          String(booking.specialistId) === String(currentSpecialistId),
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [bookings, currentSpecialistId]);

  if (!currentSpecialist) {
    return (
      <EmptyState
        icon={<CalendarClock size={48} />}
        title={t('specialist.notFoundTitle')}
        description={t('specialist.notFoundDescription')}
        variant="info"
      />
    );
  }

  return (
    <div className="specialist-schedule-page">
      <header className="specialist-schedule-page__header">
        <h1>{t('specialist.scheduleTitle')}</h1>
        <p className="specialist-schedule-page__subtitle">
          {t('specialist.scheduleSubtitle', {
            name: currentSpecialist.fullName,
            count: specialistBookings.length,
          })}
        </p>
      </header>

      {specialistBookings.length === 0 ? (
        <EmptyState
          icon={<CalendarClock size={48} />}
          title={t('specialist.scheduleEmptyTitle')}
          description={t('specialist.scheduleEmptyDescription')}
          variant="info"
        />
      ) : (
        <div className="specialist-schedule-page__list">
          {specialistBookings.map((booking) => (
            <HistoryCard
              key={booking.id}
              booking={booking}
              service={services.find((item) => item.id === booking.serviceId)}
              specialist={currentSpecialist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
