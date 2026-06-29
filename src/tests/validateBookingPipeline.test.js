import {
  assertBookingDuration,
  validateBookingBeforeSave,
  BOOKING_DURATION_ERROR_KEY,
} from "../utils/validateBookingPipeline";

describe("validateBookingPipeline", () => {
  describe("assertBookingDuration", () => {
    test("отклоняет запись без duration", () => {
      const result = assertBookingDuration({ startTime: "10:00" });
      expect(result.ok).toBe(false);
      expect(result.error).toBe(BOOKING_DURATION_ERROR_KEY);
    });

    test("принимает запись с положительным duration", () => {
      const result = assertBookingDuration({ duration: 60 });
      expect(result.ok).toBe(true);
    });
  });

  describe("validateBookingBeforeSave", () => {
    const existing = [
      {
        id: "b1",
        specialistId: "sp1",
        date: "2026-07-01",
        startTime: "10:00",
        duration: 60,
        clientName: "Тест",
      },
    ];

    test("отклоняет создание без duration до overlap", () => {
      const result = validateBookingBeforeSave(
        {
          specialistId: "sp1",
          date: "2026-07-01",
          startTime: "12:00",
        },
        existing,
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(BOOKING_DURATION_ERROR_KEY);
    });

    test("обнаруживает пересечение при валидном duration", () => {
      const result = validateBookingBeforeSave(
        {
          specialistId: "sp1",
          date: "2026-07-01",
          startTime: "10:30",
          duration: 60,
        },
        existing,
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain("10:00");
    });
  });
});
