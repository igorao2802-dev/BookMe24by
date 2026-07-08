import {
  getStepValidationErrorKey,
  getClearStepUpdates,
  isCurrentStepValid,
  getNextButtonLabelKey,
  getFirstContactsValidationError,
} from "../hooks/bookingWizard/stepValidation";
import { BOOKING_STEPS } from "../utils/constants";

describe("bookingWizard stepValidation", () => {
  describe("getStepValidationErrorKey", () => {
    test("SERVICE без serviceId → ошибка", () => {
      expect(
        getStepValidationErrorKey(BOOKING_STEPS.SERVICE, { serviceId: null }, {}),
      ).toBe("booking.validation.selectService");
    });

    test("CONTACTS с невалидной формой → первый errorKey", () => {
      expect(
        getStepValidationErrorKey(
          BOOKING_STEPS.CONTACTS,
          {},
          { isValid: false, errors: { clientPhone: "validation.phone.required" } },
        ),
      ).toBe("validation.phone.required");
    });
  });

  describe("isCurrentStepValid", () => {
    test("DATETIME без времени → невалиден", () => {
      expect(
        isCurrentStepValid(
          BOOKING_STEPS.DATETIME,
          { date: "2026-07-10", startTime: null },
          {},
        ),
      ).toBe(false);
    });

    test("SERVICE с serviceId → валиден", () => {
      expect(
        isCurrentStepValid(
          BOOKING_STEPS.SERVICE,
          { serviceId: "svc-1" },
          {},
        ),
      ).toBe(true);
    });
  });

  describe("getFirstContactsValidationError", () => {
    test("возвращает первую ошибку по порядку полей", () => {
      expect(
        getFirstContactsValidationError({
          isValid: false,
          errors: {
            clientEmail: "validation.email.invalid",
            clientName: "validation.name.tooShort",
          },
          errorParams: { clientName: { min: 2 } },
        }),
      ).toEqual({
        key: "validation.name.tooShort",
        params: { min: 2 },
      });
    });
  });

  describe("getNextButtonLabelKey", () => {
    test("шаги 1–4 → booking.buttons.next", () => {
      expect(getNextButtonLabelKey(BOOKING_STEPS.SERVICE)).toBe(
        "booking.buttons.next",
      );
      expect(getNextButtonLabelKey(BOOKING_STEPS.SPECIALIST)).toBe(
        "booking.buttons.next",
      );
      expect(getNextButtonLabelKey(BOOKING_STEPS.DATETIME)).toBe(
        "booking.buttons.next",
      );
      expect(getNextButtonLabelKey(BOOKING_STEPS.CONTACTS)).toBe(
        "booking.buttons.next",
      );
    });

    test("шаг 5 → booking.buttons.confirm", () => {
      expect(getNextButtonLabelKey(BOOKING_STEPS.CONFIRM)).toBe(
        "booking.buttons.confirm",
      );
    });
  });

  describe("getClearStepUpdates", () => {
    test("DATETIME сбрасывает date и startTime", () => {
      expect(getClearStepUpdates(BOOKING_STEPS.DATETIME)).toEqual({
        date: null,
        startTime: null,
      });
    });
  });
});
