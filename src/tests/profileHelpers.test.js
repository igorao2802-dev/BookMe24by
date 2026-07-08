import {
  filterClientBookings,
  computeClientStats,
  deriveProfileData,
} from "../utils/profileHelpers";

describe("profileHelpers", () => {
  const mockBookings = [
    {
      id: "1",
      clientPhone: "+375 (29) 123-45-67",
      clientName: "Иванова Анна",
      status: "confirmed",
      totalPrice: 50,
      date: "2026-06-15",
    },
    {
      id: "2",
      clientPhone: "+375331234567",
      clientName: "Петров Иван",
      status: "cancelled",
      totalPrice: 30,
      date: "2026-07-01",
    },
    {
      id: "3",
      clientPhone: "+375291234567",
      clientName: "Иванова Анна",
      status: "completed",
      totalPrice: 80,
      date: "2026-07-10",
    },
    {
      id: "4",
      clientPhone: "+375291234567",
      clientName: "Иванова Анна",
      status: "pending",
      totalPrice: 40,
      date: "2026-07-05",
    },
  ];

  describe("filterClientBookings", () => {
    test("должен вернуть записи с совпадающим телефоном", () => {
      const filtered = filterClientBookings(mockBookings, "+375 (29) 123-45-67");

      expect(filtered).toHaveLength(3);
      expect(filtered.map((b) => b.id)).toEqual(
        expect.arrayContaining(["1", "3", "4"]),
      );
    });

    test("должен вернуть пустой массив при несовпадении телефона", () => {
      const filtered = filterClientBookings(mockBookings, "+375 (44) 999-99-99");

      expect(filtered).toEqual([]);
    });

    test("должен вернуть пустой массив для пустого входного списка", () => {
      expect(filterClientBookings([], "+375291234567")).toEqual([]);
    });

    test("без телефона возвращает все записи, отсортированные по date desc", () => {
      const filtered = filterClientBookings(mockBookings, "");

      expect(filtered).toHaveLength(4);
      expect(filtered[0].date).toBe("2026-07-10");
      expect(filtered[3].date).toBe("2026-06-15");
    });
  });

  describe("computeClientStats", () => {
    test("должен корректно считать total, confirmed, cancelled и spent", () => {
      const clientBookings = filterClientBookings(
        mockBookings,
        "+375291234567",
      );

      expect(computeClientStats(clientBookings)).toEqual({
        total: 3,
        confirmed: 2,
        cancelled: 0,
        spent: 130,
      });

      expect(computeClientStats(mockBookings)).toEqual({
        total: 4,
        confirmed: 2,
        cancelled: 1,
        spent: 130,
      });
    });
  });

  describe("deriveProfileData", () => {
    test("должен отдавать приоритет userSettings над profileData", () => {
      const profileData = {
        name: "Иванова Анна",
        phone: "+375291234567",
        email: "old@example.com",
      };

      const result = deriveProfileData(profileData, {
        phone: "+375 (33) 111-22-33",
        email: "new@example.com",
      });

      expect(result).toEqual({
        name: "Иванова Анна",
        phone: "+375 (33) 111-22-33",
        email: "new@example.com",
      });
    });

    test("должен вернуть null если profileData отсутствует", () => {
      expect(deriveProfileData(null, { phone: "+375291234567" })).toBeNull();
    });

    test("должен использовать profileData если userSettings пустые", () => {
      const profileData = {
        name: "Test",
        phone: "+375291234567",
        email: "test@example.com",
      };

      expect(deriveProfileData(profileData, {})).toEqual(profileData);
    });
  });
});
