/**
 * TimeSlotPicker.jsx — выбор даты и времени
 */
import { useMemo } from "react";
import { useTimeSlots } from "../../hooks/useTimeSlots";
import { BUSINESS_CONFIG } from "../../utils/constants";
import { useLanguage } from "../../hooks/useLanguage";
import {
  generateAvailableDates,
  groupSlotsByTimeOfDay,
} from "../../utils/timeSlotPickerHelpers";
import TimeSlotDateGrid from "./TimeSlotDateGrid";
import TimeSlotTimeGroups from "./TimeSlotTimeGroups";
import "./TimeSlotPicker.css";

export default function TimeSlotPicker({
  service,
  specialist,
  bookings,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
}) {
  const { t, language } = useLanguage();

  const availableDates = useMemo(
    () => generateAvailableDates(BUSINESS_CONFIG.MAX_BOOKING_DAYS),
    [],
  );

  const { slots, isLoading, error } = useTimeSlots({
    date: selectedDate,
    specialist,
    service,
    existingBookings: bookings,
  });

  const groupedSlots = useMemo(
    () => groupSlotsByTimeOfDay(slots),
    [slots],
  );

  const availableCount = slots?.filter((s) => s.isAvailable).length || 0;

  return (
    <div className="time-slot-picker">
      <div className="time-slot-picker__header">
        <h2>{t("timeSlotPicker.title")}</h2>
        <p className="time-slot-picker__subtitle">
          {specialist?.fullName} • {service?.name} • {service?.duration}{" "}
          {t("time.minutes")}
        </p>
      </div>

      <TimeSlotDateGrid
        availableDates={availableDates}
        selectedDate={selectedDate}
        specialist={specialist}
        language={language}
        onSelectDate={onSelectDate}
        t={t}
      />

      <TimeSlotTimeGroups
        selectedDate={selectedDate}
        groupedSlots={groupedSlots}
        availableCount={availableCount}
        selectedTime={selectedTime}
        isLoading={isLoading}
        error={error}
        onSelectTime={onSelectTime}
        t={t}
      />
    </div>
  );
}
