/**
 * BookingWizard.jsx — главный компонент многошаговой записи (Stepper)
 *
 * Композиция шагов и JSX; бизнес-логика — в useBookingWizard.
 */
import { useMemo } from 'react';
import { Check, ArrowLeft, Trash2 } from 'lucide-react';

import ServiceSelector from './ServiceSelector';
import SpecialistSelector from './SpecialistSelector';
import TimeSlotPicker from './TimeSlotPicker';
import BookingForm from './BookingForm';
import BookingConfirmationStep from './BookingConfirmationStep';
import BookingList from './BookingList';
import NextButton from './NextButton';

import Button from '../UI/Button';
import ConfirmDialog from '../UI/ConfirmDialog';
import Toast from '../UI/Toast';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useLanguage } from '../../hooks/useLanguage';
import { useBookingWizard } from '../../hooks/useBookingWizard';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { createToastNotify } from '../../utils/createNotify';
import { BOOKING_STEPS, STORAGE_KEYS, STORAGE_DEBOUNCE_MS } from '../../utils/constants';
import './BookingWizard.css';

const STEP_TRANSLATION_KEYS = {
  [BOOKING_STEPS.SERVICE]: 'booking.steps.service',
  [BOOKING_STEPS.SPECIALIST]: 'booking.steps.specialist',
  [BOOKING_STEPS.DATETIME]: 'booking.steps.datetime',
  [BOOKING_STEPS.CONTACTS]: 'booking.steps.contacts',
  [BOOKING_STEPS.CONFIRM]: 'booking.steps.confirm',
};

export default function BookingWizard({
  services,
  specialists,
  bookings,
  onCreateBooking,
}) {
  const { t } = useLanguage();
  const { confirm, dialogProps } = useConfirmDialog();

  // ПОЧЕМУ notify создаётся в UI, а не в хуке?
  // Toast — презентационный слой; useBookingWizard возвращает только бизнес-результаты.
  const notify = useMemo(
    () =>
      createToastNotify(Toast, {
        success: 2000,
        error: 3000,
        info: 3000,
      }),
    [],
  );

  const [lastClientPhone] = useLocalStorage(
    STORAGE_KEYS.LAST_CLIENT_PHONE,
    '',
    { debounceMs: STORAGE_DEBOUNCE_MS.IMMEDIATE },
  );

  const {
    currentStep,
    draft,
    updateDraft,
    selectedService,
    selectedSpecialist,
    goNext,
    goBack,
    handleConfirm,
    handleClearForm,
    isSubmitting,
    lastCreatedBooking,
    ui: {
      handleServiceSelect,
      handleSpecialistSelect,
      handleSelectDate,
      handleSelectTime,
      goToStep,
      contactsFormValidation,
      showMyBookings,
      handleNewBooking,
    },
  } = useBookingWizard({ services, specialists, onCreateBooking, confirm, notify });

  const progressPercent =
    ((currentStep - 1) / (BOOKING_STEPS.CONFIRM - 1)) * 100;

  // ПОЧЕМУ не используем draft.clientPhone для списка «Мои записи»?
  // После успешной записи clearDraft() обнуляет draft, и фильтр по draft
  // отбрасывал все предыдущие записи — оставалась только lastCreatedBooking.
  const clientPhoneForList =
    lastClientPhone || lastCreatedBooking?.clientPhone || '';

  const myBookings = useMemo(() => {
    const normalizedFilter = clientPhoneForList.replace(/\D/g, '');
    if (!normalizedFilter) return bookings;

    return bookings.filter((b) => {
      if (!b.clientPhone) return false;
      return b.clientPhone.replace(/\D/g, '') === normalizedFilter;
    });
  }, [bookings, clientPhoneForList]);

  if (showMyBookings) {
    return (
      <div className="booking-wizard">
        <BookingList
          bookings={myBookings}
          services={services}
          specialists={specialists}
          onNewBooking={handleNewBooking}
          lastCreatedBooking={lastCreatedBooking}
        />
      </div>
    );
  }

  return (
    <div className="booking-wizard">
      <div className="booking-wizard__header">
        <h1>{t('booking.title')}</h1>
        <p className="booking-wizard__subtitle">{t('booking.subtitle')}</p>
      </div>

      <div className="booking-wizard__progress">
        <div className="booking-wizard__steps">
          {Object.values(BOOKING_STEPS).map((stepNum) => {
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;
            const isClickable = isCompleted;
            const stepLabel = t(STEP_TRANSLATION_KEYS[stepNum]);

            return (
              <div
                key={stepNum}
                className={`booking-wizard__step ${
                  isActive ? 'booking-wizard__step--active' : ''
                } ${isCompleted ? 'booking-wizard__step--completed' : ''} ${
                  isClickable ? 'booking-wizard__step--clickable' : ''
                }`}
                onClick={() => isClickable && goToStep(stepNum)}
              >
                <div className="booking-wizard__step-circle">
                  {isCompleted ? <Check size={16} /> : stepNum}
                </div>
                <span className="booking-wizard__step-label">{stepLabel}</span>
              </div>
            );
          })}
        </div>
        <div className="booking-wizard__progress-bar">
          <div
            className="booking-wizard__progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="booking-wizard__content">
        {currentStep === BOOKING_STEPS.SERVICE && (
          <ServiceSelector
            services={services}
            selectedServiceId={draft.serviceId}
            onSelect={handleServiceSelect}
          />
        )}

        {currentStep === BOOKING_STEPS.SPECIALIST && (
          <SpecialistSelector
            specialists={specialists}
            services={services}
            selectedServiceId={draft.serviceId}
            selectedSpecialistId={draft.specialistId}
            onSelect={handleSpecialistSelect}
          />
        )}

        {currentStep === BOOKING_STEPS.DATETIME && (
          <TimeSlotPicker
            service={selectedService}
            specialist={selectedSpecialist}
            bookings={bookings}
            selectedDate={draft.date}
            selectedTime={draft.startTime}
            onSelectDate={handleSelectDate}
            onSelectTime={handleSelectTime}
          />
        )}

        {currentStep === BOOKING_STEPS.CONTACTS && (
          <BookingForm draft={draft} onChange={updateDraft} />
        )}

        {currentStep === BOOKING_STEPS.CONFIRM && (
          <BookingConfirmationStep
            draft={draft}
            service={selectedService}
            specialist={selectedSpecialist}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      <div className="booking-wizard__navigation">
        <div className="booking-wizard__nav-group booking-wizard__nav-group--start">
          {currentStep > BOOKING_STEPS.SERVICE && (
            <Button
              variant="outline"
              onClick={goBack}
              leftIcon={<ArrowLeft size={16} />}
              className="booking-wizard__btn-back"
              aria-label={t('common.back')}
            >
              <span className="booking-wizard__nav-label booking-wizard__nav-label--desktop">
                {t('common.back')}
              </span>
            </Button>
          )}
        </div>

        <div className="booking-wizard__nav-group booking-wizard__nav-group--center">
          <Button
            variant="outline"
            onClick={handleClearForm}
            leftIcon={<Trash2 size={16} />}
            className="booking-wizard__btn-clear"
            aria-label={t('booking.clearForm')}
          >
            <span className="booking-wizard__nav-label booking-wizard__nav-label--desktop">
              {t('booking.clearForm')}
            </span>
            <span className="booking-wizard__nav-label booking-wizard__nav-label--mobile">
              {t('booking.clearFormShort')}
            </span>
          </Button>
        </div>

        <div className="booking-wizard__nav-group booking-wizard__nav-group--end">
          <NextButton
            currentStep={currentStep}
            draft={draft}
            contactsFormValidation={contactsFormValidation}
            onClick={
              currentStep === BOOKING_STEPS.CONFIRM ? handleConfirm : goNext
            }
            t={t}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
