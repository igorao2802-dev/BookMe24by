import { renderHook, act } from "@testing-library/react";
import { useSpecialists } from "../hooks/useSpecialists";

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

function applySetter(mockSetter, prevState) {
  const updater = mockSetter.mock.calls[mockSetter.mock.calls.length - 1][0];
  return typeof updater === "function" ? updater(prevState) : updater;
}

describe("useSpecialists", () => {
  let mockSetCustomSpecialists;
  let customSpecialists;

  const renderUseSpecialists = (jsonSpecialists = []) =>
    renderHook(() =>
      useSpecialists({
        jsonSpecialists,
        customSpecialists,
        setCustomSpecialists: mockSetCustomSpecialists,
      }),
    );

  beforeEach(() => {
    customSpecialists = [];
    mockSetCustomSpecialists = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("должен создать нового специалиста", () => {
    const { result } = renderUseSpecialists([]);

    act(() => {
      const response = result.current.addSpecialist({
        fullName: "Иванова Мария Петровна",
        position: "Стилист",
        experience: 5,
        serviceIds: ["service-1"],
      });

      expect(response.success).toBe(true);
      const nextState = applySetter(mockSetCustomSpecialists, customSpecialists);
      expect(nextState).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fullName: "Иванова Мария Петровна",
            position: "Стилист",
            rating: 4.5,
          }),
        ]),
      );
    });
  });

  test("должен отклонить специалиста без ФИО", () => {
    const { result } = renderUseSpecialists([]);

    act(() => {
      const response = result.current.addSpecialist({
        fullName: "",
        position: "Стилист",
        experience: 5,
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe("validation.specialist.nameRequired");
    });
  });

  test("должен обновить существующего специалиста", () => {
    customSpecialists = [
      {
        id: "test-specialist-1",
        fullName: "Старое ФИО",
        position: "Стилист",
        experience: 5,
        serviceIds: ["service-1"],
        isCustom: true,
      },
    ];

    const { result } = renderUseSpecialists([]);

    act(() => {
      const response = result.current.updateSpecialist("test-specialist-1", {
        fullName: "Новое ФИО",
      });

      expect(response.success).toBe(true);
      const nextState = applySetter(mockSetCustomSpecialists, customSpecialists);
      expect(nextState).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ fullName: "Новое ФИО" }),
        ]),
      );
    });
  });

  test("должен удалить специалиста", () => {
    customSpecialists = [
      {
        id: "test-specialist-1",
        fullName: "Тестовый специалист",
        isCustom: true,
      },
    ];

    const { result } = renderUseSpecialists([]);

    act(() => {
      const response = result.current.deleteSpecialist("test-specialist-1");

      expect(response.success).toBe(true);
      const nextState = applySetter(mockSetCustomSpecialists, customSpecialists);
      expect(nextState).toEqual([]);
    });
  });

  test("не должен удалить стандартного специалиста", () => {
    const standardSpecialist = {
      id: "standard-specialist-1",
      fullName: "Стандартный специалист",
      isCustom: false,
    };

    const { result } = renderUseSpecialists([standardSpecialist]);

    act(() => {
      const response = result.current.deleteSpecialist("standard-specialist-1");

      expect(response.success).toBe(false);
      expect(response.error).toBe("validation.specialist.cannotDeleteStandard");
    });
  });
});
