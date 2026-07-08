import { BOOKING_STATUS } from "../utils/constants";
import {
  filterBookingsBySpecialist,
  computeSpecialistStats,
  getSpecialistServices,
} from "../utils/specialistHelpers";

describe("specialistHelpers", () => {
  const bookings = [
    {
      id: "b1",
      specialistId: "spc_01",
      serviceId: "svc_1",
      status: BOOKING_STATUS.CONFIRMED,
    },
    {
      id: "b2",
      specialistId: "spc_02",
      serviceId: "svc_2",
      status: BOOKING_STATUS.PENDING,
    },
    {
      id: "b3",
      specialistId: "spc_01",
      serviceId: "svc_1",
      status: BOOKING_STATUS.CANCELLED,
    },
  ];

  const services = [
    { id: "svc_1", price: 50 },
    { id: "svc_2", price: 30 },
  ];

  test("filterBookingsBySpecialist возвращает записи мастера", () => {
    const result = filterBookingsBySpecialist(bookings, "spc_01");
    expect(result).toHaveLength(2);
    expect(result.every((item) => item.specialistId === "spc_01")).toBe(true);
  });

  test("computeSpecialistStats считает KPI мастера", () => {
    const specialistBookings = filterBookingsBySpecialist(bookings, "spc_01");
    const stats = computeSpecialistStats(specialistBookings, services, {
      rating: 4.8,
    });

    expect(stats.total).toBe(2);
    expect(stats.confirmed).toBe(1);
    expect(stats.cancelled).toBe(1);
    expect(stats.revenue).toBe(50);
    expect(stats.rating).toBe(4.8);
  });

  test("getSpecialistServices возвращает услуги мастера", () => {
    const specialist = { serviceIds: ["svc_2", "svc_1"] };
    const allServices = [
      { id: "svc_1", name: "Стрижка" },
      { id: "svc_2", name: "Маникюр" },
      { id: "svc_3", name: "Массаж" },
    ];

    const result = getSpecialistServices(allServices, specialist);

    expect(result).toHaveLength(2);
    expect(result.map((item) => item.id)).toEqual(["svc_2", "svc_1"]);
  });
});
