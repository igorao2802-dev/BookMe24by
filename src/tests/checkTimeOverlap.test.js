import {
  checkTimeOverlap,
  isWithinWorkingHours,
} from "../utils/checkTimeOverlap";

describe("checkTimeOverlap", () => {
  const baseExisting = {
    id: "booking-1",
    specialistId: "sp-1",
    date: "2026-07-01",
    startTime: "10:00",
    duration: 120,
    clientName: "Анна",
    status: "confirmed",
  };

  test("не считает пересечением окна разных мастеров", () => {
    const result = checkTimeOverlap(
      {
        specialistId: "sp-2",
        date: "2026-07-01",
        startTime: "10:30",
        duration: 60,
      },
      [baseExisting],
    );

    expect(result.hasOverlap).toBe(false);
  });

  test("обнаруживает пересечение при 2-часовой услуге и старте через 20 минут", () => {
    const result = checkTimeOverlap(
      {
        specialistId: "sp-1",
        date: "2026-07-01",
        startTime: "10:20",
        duration: 60,
      },
      [baseExisting],
      15,
    );

    expect(result.hasOverlap).toBe(true);
    expect(result.conflictingBooking?.id).toBe("booking-1");
  });

  test("учитывает буфер 15 мин между клиентами", () => {
    // 10:00 + 120 мин услуга + 15 буфер = занято до 12:15
    const result = checkTimeOverlap(
      {
        specialistId: "sp-1",
        date: "2026-07-01",
        startTime: "12:00",
        duration: 30,
      },
      [baseExisting],
      15,
    );

    expect(result.hasOverlap).toBe(true);
  });

  test("разрешает запись сразу после буфера", () => {
    const result = checkTimeOverlap(
      {
        specialistId: "sp-1",
        date: "2026-07-01",
        startTime: "12:15",
        duration: 30,
      },
      [baseExisting],
      15,
    );

    expect(result.hasOverlap).toBe(false);
  });

  test("игнорирует отменённые записи", () => {
    const result = checkTimeOverlap(
      {
        specialistId: "sp-1",
        date: "2026-07-01",
        startTime: "10:30",
        duration: 60,
      },
      [{ ...baseExisting, status: "cancelled" }],
      15,
    );

    expect(result.hasOverlap).toBe(false);
  });

  test("исключает редактируемую запись по id", () => {
    const result = checkTimeOverlap(
      {
        id: "booking-1",
        specialistId: "sp-1",
        date: "2026-07-01",
        startTime: "10:00",
        duration: 120,
      },
      [baseExisting],
      15,
    );

    expect(result.hasOverlap).toBe(false);
  });
});

describe("isWithinWorkingHours", () => {
  const specialist = {
    workingHours: {
      "0": null,
      "1": { start: "09:00", end: "18:00" },
      "2": { start: "09:00", end: "18:00" },
      "3": { start: "09:00", end: "18:00" },
      "4": { start: "09:00", end: "18:00" },
      "5": { start: "09:00", end: "18:00" },
      "6": null,
    },
  };

  test("отклоняет запись, выходящую за конец рабочего дня", () => {
    const result = isWithinWorkingHours(
      {
        date: "2026-06-29",
        startTime: "17:30",
        duration: 60,
      },
      specialist,
    );

    expect(result.isWithin).toBe(false);
  });

  test("принимает запись в пределах рабочего дня", () => {
    const result = isWithinWorkingHours(
      {
        date: "2026-06-29",
        startTime: "10:00",
        duration: 60,
      },
      specialist,
    );

    expect(result.isWithin).toBe(true);
  });
});
