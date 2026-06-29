/**
 * ThemeContext.jsx — контекст для управления темой приложения
 *
 * ПОЧЕМУ только light/dark?
 * Достаточно для UX; auto-theme усложнял синхронизацию с ThemeToggle.
 */

import { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS, STORAGE_DEBOUNCE_MS } from '../utils/constants';

// === СОЗДАНИЕ КОНТЕКСТА ===
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false,
});

// === ПРОВАЙДЕР ТЕМЫ ===
export function ThemeProvider({ children }) {
  // === СОСТОЯНИЕ ТЕМЫ ===
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.THEME, 'light', {
    debounceMs: STORAGE_DEBOUNCE_MS.DEFAULT,
  });

  // ПОЧЕМУ бинарное переключение: один клик — одна тема, без промежуточных состояний
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // === ВЫЧИСЛЕНИЕ isDark ===
  const isDark = theme === 'dark';

  // === ПРИМЕНЕНИЕ data-theme К <html> ===
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value = {
    theme,
    toggleTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// === ХУК ДЛЯ ДОСТУПА К КОНТЕКСТУ ===
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (process.env.NODE_ENV === 'development') {
    if (!context) {
      console.warn('useTheme должен использоваться внутри ThemeProvider');
    }
  }
  
  return context;
}

export default ThemeContext;