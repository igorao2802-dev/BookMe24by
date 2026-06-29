import { renderHook, act, waitFor } from "@testing-library/react";

import { useBookingWizard } from "../hooks/useBookingWizard";

const mockClearDraft = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null, pathname: "/booking" }),
}));

jest.mock("../hooks/useLocalStorage", () => ({
  useLocalStorage: () => {
    const draft = {
      serviceId: null,
      specialistId: null,
      date: null,
      startTime: null,
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      comment: "",
    };
    return [draft, jest.fn(), (...args) => mockClearDraft(...args)];
  },
}));

jest.mock("../hooks/useLanguage", () => ({
  useLanguage: () => ({
    t: (key) => key,
  }),
}));

jest.mock("../hooks/useRateLimiter", () => ({
  useRateLimiter: () => ({
    checkLimit: () => ({ allowed: true }),
    reset: jest.fn(),
  }),
}));

jest.mock("../components/UI/Toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("../utils/audioHelper", () => ({
  playBookingConfirmation: jest.fn(),
}));

describe("useBookingWizard — confirm в handleClearForm", () => {
  const defaultProps = {
    services: [],
    specialists: [],
    onCreateBooking: jest.fn(),
  };

  beforeEach(() => {
    mockClearDraft.mockClear();
    mockNavigate.mockClear();
  });

  test("confirm resolve true → clearDraft вызывается", async () => {
    const confirm = jest.fn().mockResolvedValue(true);

    const { result } = renderHook(() =>
      useBookingWizard({ ...defaultProps, confirm }),
    );

    await act(async () => {
      await result.current.handleClearForm();
    });

    await waitFor(() => {
      expect(confirm).toHaveBeenCalledWith({
        message: "booking.clearFormConfirm",
        variant: "warning",
      });
    });

    expect(mockClearDraft).toHaveBeenCalledTimes(1);
  });

  test("confirm resolve false → clearDraft НЕ вызывается", async () => {
    const confirm = jest.fn().mockResolvedValue(false);

    const { result } = renderHook(() =>
      useBookingWizard({ ...defaultProps, confirm }),
    );

    await act(async () => {
      await result.current.handleClearForm();
    });

    await waitFor(() => {
      expect(confirm).toHaveBeenCalled();
    });

    expect(mockClearDraft).not.toHaveBeenCalled();
  });
});
