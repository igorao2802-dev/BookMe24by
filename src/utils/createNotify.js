/**
 * createNotify.js — фабрика notify-колбэков для бизнес-хуков
 *
 * ПОЧЕМУ отдельный модуль?
 * Хуки не импортируют Toast напрямую (нарушение слоёв).
 * UI-компонент создаёт notify и передаёт в хук через props.
 */

const NOOP_NOTIFY = {
  success: () => {},
  error: () => {},
  info: () => {},
};

/**
 * @param {{ success: Function, error: Function, info?: Function }} Toast
 * @param {{ success?: number, error?: number, info?: number }} [durations]
 */
export function createToastNotify(Toast, durations = {}) {
  const {
    success: successDuration = 3000,
    error: errorDuration = 5000,
    info: infoDuration = 3000,
  } = durations;

  return {
    success: (message, options = {}) =>
      Toast.success(message, { duration: successDuration, ...options }),
    error: (message, options = {}) =>
      Toast.error(message, { duration: errorDuration, ...options }),
    info: (message, options = {}) =>
      Toast.info(message, { duration: infoDuration, ...options }),
  };
}

export function getNoopNotify() {
  return NOOP_NOTIFY;
}

export default createToastNotify;
