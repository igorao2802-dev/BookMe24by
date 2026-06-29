/**
 * App.jsx — корневая точка сборки SPA bookme24
 *
 * АРХИТЕКТУРНАЯ РОЛЬ:
 * Только глобальные провайдеры, bootstrap через useInitialData
 * и делегирование маршрутизации в AppRoutes. CRUD и domain-state — в hooks/.
 */

import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';

import AppLoading, { AppLoadError } from './components/AppLoading';
import AppRoutes from './components/AppRoutes';

import { useInitialData } from './hooks/useInitialData';

/**
 * Внутренний shell после монтирования LanguageProvider.
 * ПОЧЕМУ отдельный компонент?
 * useInitialData не зависит от i18n, но AppLoading/AppLoadError используют useLanguage.
 */
function AppShell() {
  const { isLoading, error, salon, userRole, setUserRole } = useInitialData();

  if (isLoading) {
    return <AppLoading />;
  }

  if (error) {
    return <AppLoadError />;
  }

  return (
    <AppRoutes
      salon={salon}
      userRole={userRole}
      onRoleChange={setUserRole}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppShell />
      </LanguageProvider>
    </ThemeProvider>
  );
}
