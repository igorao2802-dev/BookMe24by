/**
 * HistoryCard.jsx — карточка записи в истории клиента
  * ПОЧЕМУ: отображение статуса через t() и добавлены fallback для интерполяции
 */
import { Calendar, Clock, User, RotateCcw, XCircle } from 'lucide-react';
import { BOOKING_STATUS } from '../../utils/constants';
import { formatPrice, formatDateShort } from '../../utils/formatters';
import { calculateEndTime } from '../../utils/timeHelpers';
import { useLanguage } from '../../hooks/useLanguage';
import Badge from '../UI/Badge';
import Button from '../UI/Button';
import ConfirmDialog from '../UI/ConfirmDialog';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import './HistoryCard.css';

export default function HistoryCard({
  booking,
  service,
  specialist,
  onCancel,
  onRebook,
}) {
  const { t } = useLanguage();
  const { confirm, dialogProps } = useConfirmDialog();

  const endTime =
    booking.startTime && booking.duration
      ? calculateEndTime(booking.startTime, booking.duration)
      : null;

  const canCancel =
    booking.status === BOOKING_STATUS.PENDING ||
    booking.status === BOOKING_STATUS.CONFIRMED;

  const canRebook =
    booking.status === BOOKING_STATUS.COMPLETED ||
    booking.status === BOOKING_STATUS.CANCELLED;

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: t('profile.bookings.confirmCancel'),
      message:
        `${t('booking.confirmation.service')} ${service?.name || t('common.unknown')}\n` +
        `${t('booking.confirmation.date')} ${formatDateShort(booking.date)} ${t('booking.confirmation.time')} ${booking.startTime || '—'}`,
      variant: 'danger',
    });
    if (confirmed && onCancel) {
      onCancel(booking.id);
    }
  };

  const handleRebook = () => {
    if (onRebook) {
      onRebook(booking);
    }
  };

  return (
    <>
    <article className={`history-card history-card--${booking.status}`}>
      <div className="history-card__header">
        {/* ПОЧЕМУ: fallback для названия услуги */}
        <h3 className="history-card__title">
          {service?.name || t('common.serviceNotFound')}
        </h3>
        
        {/* ПОЧЕМУ: динамический перевод статуса вместо BOOKING_STATUS_LABELS */}
        <Badge variant={booking.status}>
          {t(`status.${booking.status}`)}
        </Badge>
      </div>

      <div className="history-card__info">
        <div className="history-card__info-item">
          <User size={14} />
          {/* ПОЧЕМУ: fallback для имени специалиста */}
          <span>{specialist?.fullName || t('common.specialistNotSpecified')}</span>
        </div>

        <div className="history-card__info-item">
          <Calendar size={14} />
          <span>{formatDateShort(booking.date) || '—'}</span>
        </div>

        <div className="history-card__info-item">
          <Clock size={14} />
          <span>
            {booking.startTime || '—'}
            {endTime && ` — ${endTime}`}
          </span>
        </div>
      </div>

      <div className="history-card__price">
        {formatPrice(booking.totalPrice || service?.price || 0)}
      </div>

      {booking.comment && (
        <div className="history-card__comment text-break">
          💬 {booking.comment}
        </div>
      )}

      {((canCancel && onCancel) || (canRebook && onRebook)) && (
        <div className="history-card__actions">
          {canCancel && onCancel && (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<XCircle size={14} />}
              onClick={handleCancel}
            >
              {t('profile.history.buttons.cancel')}
            </Button>
          )}

          {canRebook && onRebook && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw size={14} />}
              onClick={handleRebook}
            >
              {t('profile.history.buttons.rebook')}
            </Button>
          )}
        </div>
      )}
    </article>
    <ConfirmDialog {...dialogProps} />
  </>
  );
}