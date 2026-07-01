/**
 * SpecialistModal.jsx — модальное окно для формы специалиста
 */
import { useRef } from 'react';
import Modal from '../UI/Modal';
import ConfirmDialog from '../UI/ConfirmDialog';
import SpecialistForm from './SpecialistForm';
import { useLanguage } from '../../hooks/useLanguage';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

export default function SpecialistModal({
  isOpen,
  mode = 'add',
  specialist = null,
  services = [],
  existingSpecialists = [],
  onSave,
  onClose,
}) {
  const { t } = useLanguage();
  const { confirm, dialogProps } = useConfirmDialog();
  const isDirtyRef = useRef(false);

  const handleSave = (specialistData) => {
    const result = onSave(specialistData);
    if (result?.success === true) {
      isDirtyRef.current = false;
      onClose();
    }
  };

  const handleClose = async () => {
    if (isDirtyRef.current) {
      const confirmed = await confirm({
        message: t('admin.specialists.form.unsavedChanges'),
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
      ? t('admin.specialists.form.editTitle')
      : t('admin.specialists.form.addTitle');

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={title} size="lg">
        <div onChange={handleFormChange}>
          <SpecialistForm
            mode={mode}
            specialist={specialist}
            services={services}
            existingSpecialists={existingSpecialists}
            onSave={handleSave}
            onCancel={handleClose}
          />
        </div>
      </Modal>
      <ConfirmDialog {...dialogProps} />
    </>
  );
}
