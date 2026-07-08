/**
 * TimeSlotDateGrid.jsx — горизонтальная сетка выбора даты
 */

import { useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
import { formatDateForInput } from "../../utils/timeHelpers";
import { getDateUnavailableReason } from "../../utils/timeSlotPickerHelpers";

export default function TimeSlotDateGrid({
  availableDates,
  selectedDate,
  specialist,
  language,
  onSelectDate,
  t,
}) {
  const dateGridRef = useRef(null);

  useEffect(() => {
    const container = dateGridRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  const locale = language === "en" ? "en-US" : "ru-RU";

  return (
    <div className="time-slot-picker__dates">
      <h3 className="time-slot-picker__section-title">
        <Calendar size={18} />
        {t("timeSlotPicker.visitDate")}
      </h3>

      <div className="time-slot-picker__date-grid" ref={dateGridRef}>
        {availableDates.map((date) => {
          const dateStr = formatDateForInput(date);
          const isSelected = selectedDate === dateStr;
          const dayName = date.toLocaleDateString(locale, { weekday: "short" });
          const dayNum = date.getDate();
          const monthName = date.toLocaleDateString(locale, { month: "short" });
          const unavailableReason = getDateUnavailableReason(
            date,
            specialist,
            t,
          );
          const isDisabled = unavailableReason !== null;
          const pastLabel = t("timeSlotPicker.pastDate");

          const dateClasses = [
            "time-slot-picker__date",
            isSelected && "time-slot-picker__date--selected",
            isDisabled &&
              unavailableReason === pastLabel &&
              "time-slot-picker__date--past",
            isDisabled &&
              unavailableReason !== pastLabel &&
              "time-slot-picker__date--not-working",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={dateStr}
              type="button"
              className={dateClasses}
              disabled={isDisabled}
              onClick={() => !isDisabled && onSelectDate(dateStr)}
              title={
                unavailableReason ||
                `${dayNum} ${monthName} — ${t("timeSlotPicker.selectDate")}`
              }
              aria-label={
                unavailableReason
                  ? `${dayNum} ${monthName} — ${t("timeSlotPicker.unavailable")}: ${unavailableReason}`
                  : `${dayNum} ${monthName} — ${t("timeSlotPicker.selectDate")}`
              }
            >
              <span className="time-slot-picker__date-day">{dayName}</span>
              <span className="time-slot-picker__date-num">{dayNum}</span>
              <span className="time-slot-picker__date-month">{monthName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
