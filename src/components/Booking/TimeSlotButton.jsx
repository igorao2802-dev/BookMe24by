/**
 * TimeSlotButton.jsx — кнопка одного временного окна
 */

export default function TimeSlotButton({ slot, isSelected, onSelect, t }) {
  const slotClasses = [
    "time-slot-picker__slot",
    isSelected && "time-slot-picker__slot--selected",
    !slot.isAvailable && "time-slot-picker__slot--busy",
  ]
    .filter(Boolean)
    .join(" ");

  const tooltip = !slot.isAvailable
    ? slot.reason || t("timeSlotPicker.busy")
    : `${slot.startTime} — ${t("timeSlotPicker.selectTime")}`;

  return (
    <button
      type="button"
      className={slotClasses}
      disabled={!slot.isAvailable}
      onClick={() => slot.isAvailable && onSelect(slot.startTime)}
      title={tooltip}
      aria-label={
        !slot.isAvailable
          ? `${slot.startTime} — ${t("timeSlotPicker.unavailable")}: ${slot.reason || t("timeSlotPicker.busy")}`
          : `${slot.startTime} — ${t("timeSlotPicker.selectTime")}`
      }
      aria-pressed={isSelected}
    >
      <span className="time-slot-picker__slot-time">{slot.startTime}</span>
      {!slot.isAvailable && (
        <span className="time-slot-picker__slot-reason">
          {t("timeSlotPicker.busy")}
        </span>
      )}
    </button>
  );
}
