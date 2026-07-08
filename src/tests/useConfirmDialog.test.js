import { renderHook, act, waitFor } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useConfirmDialog } from '../hooks/useConfirmDialog';
import ConfirmDialog from '../components/UI/ConfirmDialog';

jest.mock('../hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key) => {
      const labels = {
        'common.cancel': 'Отмена',
        'common.confirm': 'Подтвердить',
        'common.close': 'Закрыть',
      };
      return labels[key] || key;
    },
  }),
}));

describe('useConfirmDialog', () => {
  test('confirm открывает диалог и resolve true при onConfirm', async () => {
    const { result } = renderHook(() => useConfirmDialog());

    let promise;
    act(() => {
      promise = result.current.confirm({
        title: 'Удаление',
        message: 'Удалить запись?',
        variant: 'danger',
      });
    });

    expect(result.current.dialogProps.isOpen).toBe(true);
    expect(result.current.dialogProps.message).toBe('Удалить запись?');
    expect(result.current.dialogProps.variant).toBe('danger');

    act(() => {
      result.current.dialogProps.onConfirm();
    });

    await expect(promise).resolves.toBe(true);
    expect(result.current.dialogProps.isOpen).toBe(false);
  });

  test('confirm resolve false при onCancel', async () => {
    const { result } = renderHook(() => useConfirmDialog());

    let promise;
    act(() => {
      promise = result.current.confirm({ message: 'Продолжить?' });
    });

    act(() => {
      result.current.dialogProps.onCancel();
    });

    await expect(promise).resolves.toBe(false);
    expect(result.current.dialogProps.isOpen).toBe(false);
  });
});

describe('ConfirmDialog', () => {
  test('рендерится изолированно с message и кнопками', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        title="Подтверждение"
        message="Вы уверены?"
        confirmLabel="Да"
        cancelLabel="Нет"
        variant="warning"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText('Вы уверены?')).toBeInTheDocument();
    expect(screen.getByText('Подтверждение')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Закрыть' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Нет' })).toHaveFocus();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Да' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('показывает подписи по умолчанию, если labels не переданы', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        message="Удалить запись?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Отмена' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Подтвердить' })).toBeInTheDocument();
  });

  test('показывает подписи по умолчанию при пустых строках из хука', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        message="Очистить форму?"
        confirmLabel=""
        cancelLabel=""
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Отмена' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Подтвердить' })).toBeInTheDocument();
  });
});
