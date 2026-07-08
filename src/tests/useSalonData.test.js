import { renderHook, act } from "@testing-library/react";
import { useSalonData } from "../hooks/useSalonData";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/constants";

jest.mock("../hooks/useBookings", () => ({
  useBookings: () => ({
    bookings: [],
    stats: { total: 0, pending: 0, confirmed: 0, cancelled: 0, completed: 0 },
    createBooking: jest.fn(),
    updateBooking: jest.fn(),
    cancelBooking: jest.fn(),
    deleteBooking: jest.fn(),
    clearAllBookings: jest.fn(),
  }),
}));

jest.mock("../hooks/useLanguage", () => ({
  useLanguage: () => ({
    t: (key) => key,
    language: "ru",
    setLanguage: jest.fn(),
  }),
}));

jest.mock("../components/UI/Toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("../utils/generateId", () => ({
  generateServiceId: () => "custom_svc_test_id",
  generateSpecialistId: jest.fn(),
}));

jest.mock("../hooks/useLocalStorage");

function applySetter(mockSetter, prevState) {
  if (mockSetter.mock.calls.length === 0) {
    return prevState;
  }

  const lastCall = mockSetter.mock.calls[mockSetter.mock.calls.length - 1];
  const updater = lastCall?.[0];
  return typeof updater === "function" ? updater(prevState) : updater;
}

function applyAllSetters(setter, prevState) {
  let next = prevState;
  setter.mock.calls.forEach(([updater]) => {
    next = typeof updater === "function" ? updater(next) : updater;
  });
  return next;
}

describe("useSalonData", () => {
  let mockSetCustomServices;
  let mockSetCustomSpecialists;
  let mockCustomServicesState;
  let mockCustomSpecialistsState;

  beforeEach(() => {
    mockCustomServicesState = [];
    mockCustomSpecialistsState = [
      {
        id: "custom_spec_1",
        fullName: "Тестовый Мастер",
        position: "Стилист",
        experience: 3,
        serviceIds: [],
        isCustom: true,
      },
    ];
    mockSetCustomServices = jest.fn();
    mockSetCustomSpecialists = jest.fn();

    useLocalStorage.mockImplementation((key, initialValue) => {
      if (key === STORAGE_KEYS.CUSTOM_SERVICES) {
        return [mockCustomServicesState, mockSetCustomServices, jest.fn()];
      }
      if (key === STORAGE_KEYS.CUSTOM_SPECIALISTS) {
        return [mockCustomSpecialistsState, mockSetCustomSpecialists, jest.fn()];
      }
      return [initialValue, jest.fn(), jest.fn()];
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("addService синхронно обновляет serviceIds мастера в одном act (без перезагрузки)", () => {
    const { result, rerender } = renderHook(() => useSalonData([], []));

    act(() => {
      const response = result.current.addService({
        name: "Новая услуга",
        category: "hair",
        description: "Описание услуги",
        duration: 60,
        price: 50,
        specialistIds: ["custom_spec_1"],
      });

      expect(response.success).toBe(true);
      expect(mockSetCustomServices).toHaveBeenCalledTimes(1);
      expect(mockSetCustomSpecialists).toHaveBeenCalledTimes(1);
    });

    mockCustomServicesState = applyAllSetters(
      mockSetCustomServices,
      mockCustomServicesState,
    );
    mockCustomSpecialistsState = applyAllSetters(
      mockSetCustomSpecialists,
      mockCustomSpecialistsState,
    );

    rerender();

    const specialist = result.current.specialists.find(
      (s) => s.id === "custom_spec_1",
    );

    expect(specialist.serviceIds).toContain("custom_svc_test_id");
    expect(result.current.services).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "custom_svc_test_id" }),
      ]),
    );
  });

  test("addService обновляет serviceIds кастомного мастера без перезагрузки", () => {
    const { result, rerender } = renderHook(() => useSalonData([], []));

    act(() => {
      result.current.addService({
        name: "Новая услуга",
        category: "hair",
        description: "Описание услуги",
        duration: 60,
        price: 50,
        specialistIds: ["custom_spec_1"],
      });
    });

    mockCustomServicesState = applySetter(
      mockSetCustomServices,
      mockCustomServicesState,
    );
    mockCustomSpecialistsState = applySetter(
      mockSetCustomSpecialists,
      mockCustomSpecialistsState,
    );

    rerender();

    const specialist = result.current.specialists.find(
      (s) => s.id === "custom_spec_1",
    );
    const newServiceId = mockCustomServicesState[0].id;

    expect(specialist).toBeDefined();
    expect(specialist.serviceIds).toContain(newServiceId);
  });

  test("specialistsWithServices обогащает JSON-мастеров связями из услуг", () => {
    const jsonSpecialists = [
      {
        id: "spc_json_1",
        fullName: "JSON Мастер",
        serviceIds: [],
        isCustom: false,
      },
    ];

    const { result, rerender } = renderHook(() =>
      useSalonData([], jsonSpecialists),
    );

    act(() => {
      const response = result.current.addService({
        name: "Услуга для JSON-мастера",
        category: "hair",
        description: "Описание услуги для JSON-мастера",
        duration: 45,
        price: 40,
        specialistIds: ["spc_json_1"],
      });

      expect(response.success).toBe(true);
      expect(mockSetCustomServices).toHaveBeenCalledTimes(1);
    });

    mockCustomServicesState = applySetter(
      mockSetCustomServices,
      mockCustomServicesState,
    );
    rerender();

    const enriched = result.current.specialistsWithServices.find(
      (s) => s.id === "spc_json_1",
    );

    expect(enriched.serviceIds).toContain(mockCustomServicesState[0].id);
  });
});
