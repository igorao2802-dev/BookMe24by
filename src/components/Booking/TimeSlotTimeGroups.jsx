/**
 * TimeSlotTimeGroups.jsx — группы окон: утро / день / вечер
 */

import { Clock, AlertCircle } from "lucide-react";
import EmptyState from "../UI/EmptyState";
import Spinner from "../UI/Spinner";
import TimeSlotButton from "./TimeSlotButton";
import { getWindowsWord } from "../../utils/timeSlotPickerHelpers";

const TIME_GROUPS = [
  { key: "morning", emoji: "🌅", labelKey: "timeSlotPicker.morning" },
  { key: "afternoon", emoji: "☀️", labelKey: "timeSlotPicker.afternoon" },
  { key: "evening", emoji: "🌆", labelKey: "timeSlotPicker.evening" },
];

export default function TimeSlotTimeGroups({
  selectedDate,
  groupedSlots,
  availableCount,
  selectedTime,
  isLoading,
  error,
  onSelectTime,
  t,
}) {
  if (!selectedDate) return null;

  return (
    <div className="time-slot-picker__times">
      <h3 className="time-slot-picker__section-title">
        <Clock size={18} />
        {t("timeSlotPicker.freeTime")} ({getWindowsWord(availableCount, t)})
      </h3>

      {error && (
        <div className="time-slot-picker__error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {isLoading && <Spinner text={t("timeSlotPicker.loading")} />}

      {!isLoading && !error && availableCount === 0 && (
        <EmptyState
          title={t("timeSlotPicker.noSlots")}
          description={t("timeSlotPicker.tryAnotherDay")}
          variant="info"
        />
      )}

      {!isLoading && !error && availableCount > 0 && (
        <>
          {TIME_GROUPS.map(({ key, emoji, labelKey }) =>
            groupedSlots[key].length > 0 ? (
              <div key={key} className="time-slot-picker__group">
                <h4 className="time-slot-picker__group-title">
                  {emoji} {t(labelKey)}
                </h4>
                <div className="time-slot-picker__slots">
                  {groupedSlots[key].map((slot) => (
                    <TimeSlotButton
                      key={slot.startTime}
                      slot={slot}
                      isSelected={selectedTime === slot.startTime}
                      onSelect={onSelectTime}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            ) : null,
          )}
        </>
      )}
    </div>
  );
}
