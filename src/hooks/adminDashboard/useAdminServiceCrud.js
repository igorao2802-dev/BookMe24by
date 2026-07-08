/**
 * useAdminServiceCrud.js — modal-state и CRUD услуг
 */

import { useState, useCallback } from "react";

const CLOSED_SERVICE_MODAL = { isOpen: false, mode: "add", service: null };

export function useAdminServiceCrud({
  services,
  onAddService,
  onUpdateService,
  onDeleteService,
  notifySuccess,
  notifyError,
}) {
  const [serviceModal, setServiceModal] = useState(CLOSED_SERVICE_MODAL);

  const handleOpenAddService = useCallback(() => {
    setServiceModal({ isOpen: true, mode: "add", service: null });
  }, []);

  const handleOpenEditService = useCallback((service) => {
    setServiceModal({ isOpen: true, mode: "edit", service });
  }, []);

  const handleCloseServiceModal = useCallback(() => {
    setServiceModal(CLOSED_SERVICE_MODAL);
  }, []);

  const handleSaveService = useCallback(
    (serviceData) => {
      let result;

      if (serviceModal.mode === "add") {
        result = onAddService(serviceData);
        if (result?.success) {
          notifySuccess("admin.services.addSuccess", { name: serviceData.name });
          handleCloseServiceModal();
        } else {
          notifyError(result);
        }
      } else {
        result = onUpdateService(serviceModal.service.id, serviceData);
        if (result?.success) {
          notifySuccess("admin.services.updateSuccess", {
            name: serviceData.name,
          });
          handleCloseServiceModal();
        } else {
          notifyError(result);
        }
      }

      return result;
    },
    [
      serviceModal,
      onAddService,
      onUpdateService,
      handleCloseServiceModal,
      notifySuccess,
      notifyError,
    ],
  );

  const handleDeleteService = useCallback(
    (serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      const result = onDeleteService(serviceId);

      if (result?.success && service) {
        notifySuccess("admin.services.deleteSuccess", { name: service.name });
      } else {
        notifyError(result);
      }
    },
    [onDeleteService, services, notifySuccess, notifyError],
  );

  return {
    serviceModal,
    handleOpenAddService,
    handleOpenEditService,
    handleSaveService,
    handleDeleteService,
    handleCloseServiceModal,
  };
}

export default useAdminServiceCrud;
