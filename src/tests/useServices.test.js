import { renderHook, act } from "@testing-library/react";
import { useServices } from "../hooks/useServices";

jest.mock("../hooks/useLanguage", () => ({
  useLanguage: () => ({
    t: (key, params) => key,
    language: "ru",
    setLanguage: jest.fn(),
  }),
}));

jest.mock("../components/UI/Toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

/** Вспомогательная функция: setState в хуках вызывается как (prev) => next */
function applySetter(mockSetter, prevState) {
  const updater = mockSetter.mock.calls[mockSetter.mock.calls.length - 1][0];
  return typeof updater === "function" ? updater(prevState) : updater;
}

describe("useServices", () => {
  let mockSetCustomServices;
  let mockSetCustomSpecialists;
  let customServices;

  const renderUseServices = (jsonServices = []) =>
    renderHook(() =>
      useServices({
        jsonServices,
        customServices,
        setCustomServices: mockSetCustomServices,
        setCustomSpecialists: mockSetCustomSpecialists,
      }),
    );

  beforeEach(() => {
    customServices = [];
    mockSetCustomServices = jest.fn();
    mockSetCustomSpecialists = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("должен создать новую услугу", () => {
    const { result } = renderUseServices([]);

    const newService = {
      name: "Тестовая услуга",
      category: "hair",
      description: "Описание услуги не короче десяти символов",
      duration: 60,
      price: 100,
      specialistIds: [],
    };

    act(() => {
      const response = result.current.addService(newService);

      expect(response.success).toBe(true);
      const nextState = applySetter(mockSetCustomServices, customServices);
      expect(nextState).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Тестовая услуга",
            category: "hair",
          }),
        ]),
      );
    });
  });

  test("должен отклонить услугу без названия", () => {
    const { result } = renderUseServices([]);

    act(() => {
      const response = result.current.addService({
        name: "",
        category: "hair",
        description: "Описание",
        duration: 60,
        price: 100,
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe("validation.service.nameRequired");
    });
  });

  test("должен отклонить XSS в названии", () => {
    const { result } = renderUseServices([]);

    act(() => {
      const response = result.current.addService({
        name: "Стрижка <script>",
        category: "hair",
        description: "Описание услуги не короче десяти символов",
        duration: 60,
        price: 100,
        specialistIds: [],
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe("validation.xssDetected");
    });
  });

  test("должен отклонить отрицательную длительность", () => {
    const { result } = renderUseServices([]);

    act(() => {
      const response = result.current.addService({
        name: "Тестовая услуга",
        category: "hair",
        description: "Описание услуги не короче десяти символов",
        duration: -5,
        price: 100,
        specialistIds: [],
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe("validation.service.durationTooShort");
    });
  });

  test("должен обновить существующую услугу", () => {
    customServices = [
      {
        id: "test-service-1",
        name: "Старое название",
        category: "hair",
        description: "Описание услуги не короче десяти символов",
        duration: 60,
        price: 100,
        isCustom: true,
      },
    ];

    const { result } = renderUseServices([]);

    act(() => {
      const response = result.current.updateService("test-service-1", {
        name: "Новое название",
      });

      expect(response.success).toBe(true);
      const nextState = applySetter(mockSetCustomServices, customServices);
      expect(nextState).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "Новое название" }),
        ]),
      );
    });
  });

  test("должен удалить услугу", () => {
    customServices = [
      {
        id: "test-service-1",
        name: "Тестовая услуга",
        isCustom: true,
      },
    ];

    const { result } = renderUseServices([]);

    act(() => {
      const response = result.current.deleteService("test-service-1");

      expect(response.success).toBe(true);
      const nextState = applySetter(mockSetCustomServices, customServices);
      expect(nextState).toEqual([]);
    });
  });

  test("не должен удалить стандартную услугу", () => {
    const standardService = {
      id: "standard-service-1",
      name: "Стандартная услуга",
      isCustom: false,
    };

    const { result } = renderUseServices([standardService]);

    act(() => {
      const response = result.current.deleteService("standard-service-1");

      expect(response.success).toBe(false);
      expect(response.error).toBe("validation.service.cannotDeleteStandard");
    });
  });
});
