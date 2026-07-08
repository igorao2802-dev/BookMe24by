/**
 * useConfirmDialog.js — Promise-based API для ConfirmDialog (Фаза 9, G.6)
 *
 * АРХИТЕКТУРНАЯ РОЛЬ:
 * Паттерн A: lift state в хук, UI — через dialogProps.
 * Позволяет заменить синхронный window.confirm на async/await в обработчиках.
 *
 * ПОЧЕМУ Promise<boolean>?
 * Минимальная миграция: `if (!(await confirm({...}))) return;`
 * без переписывания всего потока в callback-цепочки.
 */

import { useState, useCallback, useRef } from 'react';

const INITIAL_STATE = {
  isOpen: false,
  title: '',
  message: '',
  variant: 'warning',
  confirmLabel: undefined,
  cancelLabel: undefined,
};

/**
 * @returns {{
 *   confirm: (options?: {
 *     title?: string,
 *     message?: string,
 *     variant?: 'danger'|'warning',
 *     confirmLabel?: string,
 *     cancelLabel?: string,
 *   }) => Promise<boolean>,
 *   dialogProps: Object,
 * }}
 */
export function useConfirmDialog() {
  const [state, setState] = useState(INITIAL_STATE);
  const resolveRef = useRef(null);

  const closeDialog = useCallback((result) => {
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({
        isOpen: true,
        title: options.title ?? '',
        message: options.message ?? '',
        variant: options.variant ?? 'warning',
        confirmLabel: options.confirmLabel,
        cancelLabel: options.cancelLabel,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    closeDialog(true);
  }, [closeDialog]);

  const handleCancel = useCallback(() => {
    closeDialog(false);
  }, [closeDialog]);

  return {
    confirm,
    dialogProps: {
      isOpen: state.isOpen,
      title: state.title,
      message: state.message,
      variant: state.variant,
      confirmLabel: state.confirmLabel,
      cancelLabel: state.cancelLabel,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
  };
}

export default useConfirmDialog;
