/**
 * ServiceModal.jsx — модальное окно для формы услуги
 *
  * ПОЧЕМУ: корректная передача specialists в форму
 */
import { useRef } from 'react';
import Modal from '../UI/Modal';
import ConfirmDialog from '../UI/ConfirmDialog';
import ServiceForm from './ServiceForm';
import { useLanguage } from '../../hooks/useLanguage';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

export default function ServiceModal({
  isOpen,
  mode = 'add',
  service = null,
  specialists = [],
  existingServices = [],
  onSave,
  onClose,
}) {
  const { t } = useLanguage();
  const { confirm, dialogProps } = useConfirmDialog();
  const isDirtyRef = useRef(false);

  const handleSave = (serviceData) => {
    const result = onSave(serviceData);
    // ПОЧЕМУ result?.success === true, а не !== false?
    // handleOpenAddService (старый баг) возвращал undefined — форма закрывалась
    // без сохранения. Закрываем модалку только при явном успехе CRUD.
    if (result?.success === true) {
      isDirtyRef.current = false;
      onClose();
    }
  };

  const handleClose = async () => {
    if (isDirtyRef.current) {
      const confirmed = await confirm({
        message: t('admin.services.form.unsavedChanges'),
        variant: 'warning',
      });
      if (!confirmed) return;
    }
    isDirtyRef.current = false;
    onClose();
  };

  const handleFormChange = () => {
    isDirtyRef.current = true;
  };

  const title =
    mode === 'edit'
      ? t('admin.services.form.editTitle')
      : t('admin.services.form.addTitle');

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={title} size="lg">
        <div onChange={handleFormChange}>
          <ServiceForm
            mode={mode}
            service={service}
            specialists={specialists}
            existingServices={existingServices}
            onSave={handleSave}
            onCancel={handleClose}
          />
        </div>
      </Modal>
      <ConfirmDialog {...dialogProps} />
    </>
  );
}
