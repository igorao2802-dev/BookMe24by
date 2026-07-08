/**
 * AppLoading.jsx — экран загрузки при холодном старте bookme24
 *
 * АРХИТЕКТУРНАЯ РОЛЬ:
 * Изолирует UX bootstrap от корневого App.jsx. Пока useInitialData
 * подтягивает seed-JSON из public/data, пользователь видит предсказуемый
 * полноэкранный индикатор вместо пустого root или «мигающего» Layout.
 *
 * ПОЧЕМУ обёртка над Spinner, а не дублирование разметки?
 * Spinner — UI-атом для inline/fullscreen внутри страниц; AppLoading
 * добавляет контекст «инициализация приложения» и i18n-текст bootstrap.
 */

import Spinner from './UI/Spinner';
import { useLanguage } from '../hooks/useLanguage';
import './AppLoading.css';

export default function AppLoading() {
  const { t } = useLanguage();

  return (
    <div className="app-loading" role="status" aria-live="polite">
      <Spinner
        className="app-loading__spinner"
        fullScreen
        size="lg"
        text={t('common.loadingSalonData')}
      />
    </div>
  );
}

/**
 * Сообщение о сбое загрузки seed-данных.
 * ПОЧЕМУ в том же модуле?
 * Оба состояния относятся к bootstrap и не используются на внутренних страницах.
 */
export function AppLoadError() {
  const { t } = useLanguage();

  return (
    <div className="app-load-error" role="alert">
      <p className="app-load-error__message">
        {t('common.loadingSalonDataError')}
      </p>
    </div>
  );
}
