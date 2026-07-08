import { renderHook, act } from "@testing-library/react";

import { BOOKING_STEPS } from "../utils/constants";
import { useWizardSingleSpecialistPreselect } from "../hooks/bookingWizard/useBookingWizardEffects";

describe("useWizardSingleSpecialistPreselect", () => {
  test("preselect единственного мастера на шаге 2 без смены шага", () => {
    const updateDraft = jest.fn();

    renderHook(() =>
      useWizardSingleSpecialistPreselect({
        draft: { serviceId: "svc-1", specialistId: null },
        services: [{ id: "svc-1", specialistIds: ["sp-1"] }],
        currentStep: BOOKING_STEPS.SPECIALIST,
        updateDraft,
      }),
    );

    expect(updateDraft).toHaveBeenCalledWith({ specialistId: "sp-1" });
  });

  test("не preselect на других шагах", () => {
    const updateDraft = jest.fn();

    renderHook(() =>
      useWizardSingleSpecialistPreselect({
        draft: { serviceId: "svc-1", specialistId: null },
        services: [{ id: "svc-1", specialistIds: ["sp-1"] }],
        currentStep: BOOKING_STEPS.DATETIME,
        updateDraft,
      }),
    );

    expect(updateDraft).not.toHaveBeenCalled();
  });

  test("не preselect если мастер уже выбран", () => {
    const updateDraft = jest.fn();

    renderHook(() =>
      useWizardSingleSpecialistPreselect({
        draft: { serviceId: "svc-1", specialistId: "sp-2" },
        services: [{ id: "svc-1", specialistIds: ["sp-1"] }],
        currentStep: BOOKING_STEPS.SPECIALIST,
        updateDraft,
      }),
    );

    expect(updateDraft).not.toHaveBeenCalled();
  });
});
