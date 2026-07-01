/**
 * ConfirmDialog.jsx — единый диалог подтверждения действий
 *
 * АРХИТЕКТУРНАЯ РОЛЬ:
 * Замена window.confirm (Фаза 9, G.6) с доступным UI на базе Modal.
 * Используется через useConfirmDialog или с явными props.
 *
 * ПОЧЕМУ closeOnOverlayClick={false}?
 * Случайный клик по overlay не должен подтверждать деструктивное действие.
 * Отмена — явно через кнопку «Отмена», Esc или крестик.
 */

import { useEffect, useRef, useId } from 'react';
import Modal from './Modal';
import Button from './Button';
import './ConfirmDialog.css';

const DEFAULT_CONFIRM_LABEL = 'Подтвердить';
const DEFAULT_CANCEL_LABEL = 'Отмена';

export default function ConfirmDialog({
  isOpen,
  title = '',
  message,
  confirmLabel = DEFAULT_CONFIRM_LABEL,
  cancelLabel = DEFAULT_CANCEL_LABEL,
  variant = 'warning',
  onConfirm,
  onCancel,
}) {
  const cancelButtonRef = useRef(null);
  const messageId = useId();

  // ПОЧЕМУ фокус на «Отмена», а не на «Подтвердить»?
  // Безопасный UX: Enter/Esc не должны случайно подтвердить удаление.
  useEffect(() => {
    if (!isOpen) return;

    // Modal ставит фокус на контейнер dialog — переносим на «Отмена» после его mount.
    const timerId = setTimeout(() => {
      cancelButtonRef.current?.focus();
    }, 0);

    return () => clearTimeout(timerId);
  }, [isOpen]);

  const confirmButtonVariant = variant === 'danger' ? 'danger' : 'primary';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title || undefined}
      size="sm"
      closeOnOverlayClick={false}
      showCloseButton={true}
    >
      <div className={`confirm-dialog confirm-dialog--${variant}`}>
        {message && (
          <p
            id={messageId}
            className="confirm-dialog__message"
          >
            {message}
          </p>
        )}

        <div
          className="confirm-dialog__actions"
          role="group"
          aria-label="Действия подтверждения"
        >
          <Button
            ref={cancelButtonRef}
            variant="outline"
            onClick={onCancel}
            aria-describedby={message ? messageId : undefined}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmButtonVariant}
            onClick={onConfirm}
            aria-describedby={message ? messageId : undefined}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
