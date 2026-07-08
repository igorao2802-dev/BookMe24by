/**
 * useAdminSpecialistCrud.js — modal-state и CRUD специалистов
 */

import { useState, useCallback } from "react";

const CLOSED_SPECIALIST_MODAL = {
  isOpen: false,
  mode: "add",
  specialist: null,
};

export function useAdminSpecialistCrud({
  specialists,
  onAddSpecialist,
  onUpdateSpecialist,
  onDeleteSpecialist,
  notifySuccess,
  notifyError,
}) {
  const [specialistModal, setSpecialistModal] = useState(CLOSED_SPECIALIST_MODAL);

  const handleOpenAddSpecialist = useCallback(() => {
    setSpecialistModal({ isOpen: true, mode: "add", specialist: null });
  }, []);

  const handleOpenEditSpecialist = useCallback((specialist) => {
    setSpecialistModal({ isOpen: true, mode: "edit", specialist });
  }, []);

  const handleCloseSpecialistModal = useCallback(() => {
    setSpecialistModal(CLOSED_SPECIALIST_MODAL);
  }, []);

  const handleSaveSpecialist = useCallback(
    (specialistData) => {
      let result;

      if (specialistModal.mode === "add") {
        result = onAddSpecialist(specialistData);
        if (result?.success) {
          notifySuccess("admin.specialists.addSuccess", {
            name: specialistData.fullName,
          });
          handleCloseSpecialistModal();
        } else {
          notifyError(result);
        }
      } else {
        result = onUpdateSpecialist(
          specialistModal.specialist.id,
          specialistData,
        );
        if (result?.success) {
          notifySuccess("admin.specialists.updateSuccess", {
            name: specialistData.fullName,
          });
          handleCloseSpecialistModal();
        } else {
          notifyError(result);
        }
      }

      return result;
    },
    [
      specialistModal,
      onAddSpecialist,
      onUpdateSpecialist,
      handleCloseSpecialistModal,
      notifySuccess,
      notifyError,
    ],
  );

  const handleDeleteSpecialist = useCallback(
    (specialistId) => {
      const specialist = specialists.find((s) => s.id === specialistId);
      const result = onDeleteSpecialist(specialistId);

      if (result?.success && specialist) {
        notifySuccess("admin.specialists.deleteSuccess", {
          name: specialist.fullName,
        });
      } else {
        notifyError(result);
      }
    },
    [onDeleteSpecialist, specialists, notifySuccess, notifyError],
  );

  return {
    specialistModal,
    handleOpenAddSpecialist,
    handleOpenEditSpecialist,
    handleSaveSpecialist,
    handleDeleteSpecialist,
    handleCloseSpecialistModal,
  };
}

export default useAdminSpecialistCrud;
