/**
 * ThemeToggle.jsx — переключатель темы (светлая / тёмная)
 *
 * ПОЧЕМУ только два режима?
 * ThemeContext хранит бинарное значение light|dark; auto-theme убран,
 * чтобы не было рассинхрона между контекстом и UI-переключателем.
 */

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();
  const nextLabel = isDark
    ? 'Переключить на светлую тему'
    : 'Переключить на тёмную тему';
  const Icon = isDark ? Moon : Sun;

  return (
    <button
      type="button"
      className={`theme-toggle theme-toggle--${theme}`}
      onClick={toggleTheme}
      aria-label={nextLabel}
      title={nextLabel}
    >
      <Icon size={20} />
    </button>
  );
}
