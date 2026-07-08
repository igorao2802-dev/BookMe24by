/**
 * BookingConfirmationStep.jsx — шаг 5: сводка данных перед созданием записи
 *
 * ПОЧЕМУ не модалка?
 * Подтверждение — полноценный шаг визарда; кнопка «Подтвердить запись» в навигации.
 */
import { Loader2 } from 'lucide-react';
import BookingSummary from './BookingSummary';
import { useLanguage } from '../../hooks/useLanguage';
import './BookingConfirmationStep.css';

export default function BookingConfirmationStep({
  draft,
  service,
  specialist,
  isSubmitting = false,
}) {
  const { t } = useLanguage();

  return (
    <div className="booking-confirmation-step">
      <div className="booking-confirmation-step__header">
        <h2>{t('booking.confirmation.title')}</h2>
        <p className="booking-confirmation-step__intro">
          {t('booking.confirmation.intro')}
        </p>
      </div>

      {isSubmitting ? (
        <div className="booking-confirmation-step__processing" aria-live="polite">
          <BookingSummary
            draft={draft}
            service={service}
            specialist={specialist}
            isSkeleton
          />
          <div className="booking-confirmation-step__processing-indicator">
            <Loader2
              size={28}
              className="booking-confirmation-step__processing-spinner"
              aria-hidden="true"
            />
            <p className="booking-confirmation-step__processing-text">
              {t('booking.confirmation.processing')}
            </p>
          </div>
        </div>
      ) : (
        <BookingSummary
          draft={draft}
          service={service}
          specialist={specialist}
        />
      )}
    </div>
  );
}
