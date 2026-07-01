import { renderHook } from "@testing-library/react";
import { useTimeSlots } from "../hooks/useTimeSlots";

const specialist = {
  id: "sp-1",
  workingHours: {
    "0": null,
    "1": { start: "09:00", end: "18:00" },
    "2": { start: "09:00", end: "18:00" },
    "3": { start: "09:00", end: "18:00" },
    "4": { start: "09:00", end: "18:00" },
    "5": { start: "10:00", end: "16:00" },
    "6": null,
  },
};

const service = {
  id: "svc-1",
  duration: 60,
};

describe("useTimeSlots", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-29T08:00:00"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("возвращает ошибку без обязательных параметров", () => {
    const { result } = renderHook(() =>
      useTimeSlots({ date: null, specialist: null, service: null }),
    );

    expect(result.current.slots).toEqual([]);
    expect(result.current.error).toBeTruthy();
  });

  test("возвращает пустой список в нерабочий день", () => {
    const { result } = renderHook(() =>
      useTimeSlots({
        date: "2026-07-05",
        specialist,
        service,
        existingBookings: [],
      }),
    );

    expect(result.current.slots).toEqual([]);
    expect(result.current.error).toContain("не работает");
  });

  test("генерирует окна в рабочий день", () => {
    const { result } = renderHook(() =>
      useTimeSlots({
        date: "2026-06-30",
        specialist,
        service,
        existingBookings: [],
        stepMinutes: 60,
      }),
    );

    expect(result.current.error).toBeNull();
    expect(result.current.slots.length).toBeGreaterThan(0);
    expect(result.current.slots[0]).toMatchObject({
      startTime: expect.any(String),
      endTime: expect.any(String),
      isAvailable: expect.any(Boolean),
    });
  });

  test("помечает окна занятыми при пересечении с существующей записью", () => {
    const { result } = renderHook(() =>
      useTimeSlots({
        date: "2026-06-30",
        specialist,
        service,
        existingBookings: [
          {
            id: "b1",
            specialistId: "sp-1",
            date: "2026-06-30",
            startTime: "11:00",
            duration: 120,
            status: "confirmed",
            clientName: "Клиент",
          },
        ],
        stepMinutes: 60,
      }),
    );

    const slot1100 = result.current.slots.find((s) => s.startTime === "11:00");
    const slot1400 = result.current.slots.find((s) => s.startTime === "14:00");

    expect(slot1100?.isAvailable).toBe(false);
    expect(slot1400?.isAvailable).toBe(true);
  });
});
