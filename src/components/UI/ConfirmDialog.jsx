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
import { X, AlertTriangle, Trash2 } from 'lucide-react';

import Modal from './Modal';
import Button from './Button';
import { useLanguage } from '../../hooks/useLanguage';
import './ConfirmDialog.css';

const VARIANT_ICONS = {
  warning: AlertTriangle,
  danger: Trash2,
};

export default function ConfirmDialog({
  isOpen,
  title = '',
  message,
  confirmLabel,
  cancelLabel,
  variant = 'warning',
  onConfirm,
  onCancel,
}) {
  const { t } = useLanguage();
  const cancelButtonRef = useRef(null);
  const titleId = useId();
  const messageId = useId();

  const resolvedCancelLabel = cancelLabel || t('common.cancel');
  const resolvedConfirmLabel = confirmLabel || t('common.confirm');
  const IconComponent = VARIANT_ICONS[variant] || AlertTriangle;
  const confirmButtonVariant = variant === 'danger' ? 'danger' : 'primary';

  // ПОЧЕМУ фокус на «Отмена», а не на «Подтвердить»?
  // Безопасный UX: Enter/Esc не должны случайно подтвердить удаление.
  useEffect(() => {
    if (!isOpen) return;

    const timerId = setTimeout(() => {
      cancelButtonRef.current?.focus();
    }, 0);

    return () => clearTimeout(timerId);
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="sm"
      closeOnOverlayClick={false}
      showCloseButton={false}
      className="modal--confirm"
      bodyClassName="modal__body--flush"
      overlayClassName="modal-overlay--confirm"
      labelledBy={title ? titleId : undefined}
      describedBy={message ? messageId : undefined}
    >
      <div className={`confirm-dialog confirm-dialog--${variant}`}>
        <header className="confirm-dialog__header">
          <div className="confirm-dialog__title-row">
            <span className="confirm-dialog__icon" aria-hidden="true">
              <IconComponent size={22} />
            </span>
            {title && (
              <h2 id={titleId} className="confirm-dialog__title">
                {title}
              </h2>
            )}
          </div>

          <button
            type="button"
            className="confirm-dialog__close"
            onClick={onCancel}
            aria-label={t('common.close')}
          >
            <X size={20} />
          </button>
        </header>

        {message && (
          <p id={messageId} className="confirm-dialog__message">
            {message}
          </p>
        )}

        <div className="confirm-dialog__divider" role="separator" />

        <div
          className="confirm-dialog__actions"
          role="group"
          aria-label={t('common.confirm')}
        >
          <Button
            ref={cancelButtonRef}
            variant="outline"
            onClick={onCancel}
            aria-describedby={message ? messageId : undefined}
          >
            {resolvedCancelLabel}
          </Button>
          <Button
            variant={confirmButtonVariant}
            onClick={onConfirm}
            aria-describedby={message ? messageId : undefined}
          >
            {resolvedConfirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
