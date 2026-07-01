/**
 * Layout.jsx — компонент-обёртка (шапка, навигация, подвал)
 *
 * ПОЧЕМУ menuItems не объявлены здесь?
 * Единый конфиг src/config/navigation.js — один источник для Layout и AppRoutes.
 */

import { Link, useLocation } from 'react-router-dom';

import { USER_ROLES, APP_CONFIG } from '../../utils/constants.js';
import { getVisibleNavItems } from '../../config/navigation';
import ThemeToggle from '../UI/ThemeToggle';
import LanguageToggle from '../UI/LanguageToggle';
import { useLanguage } from '../../hooks/useLanguage';
import './Layout.css';

export default function Layout({ children, userRole, onRoleChange }) {
  const location = useLocation();
  const { t } = useLanguage();

  const visibleMenu = getVisibleNavItems(userRole);

  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__container">
          <div className="layout__brand">
            <Link to="/" className="layout__logo">
              💇♀️ <span>{t('common.brandName')}</span>
            </Link>
          </div>

          <nav className="layout__nav" aria-label={t('common.mainNavigation')}>
            {visibleMenu.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`layout__nav-link ${
                    isActive ? 'layout__nav-link--active' : ''
                  }`}
                >
                  <Icon
                    className="layout__nav-icon"
                    size={18}
                    aria-hidden="true"
                  />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>

          <div className="layout__controls">
            <ThemeToggle />
            <LanguageToggle />
            {APP_CONFIG.SHOW_DEMO_ROLE_SWITCHER && (
              <div className="layout__role-switcher">
                <label className="layout__role-label">
                  {t('common.role')}:
                  <select
                    value={userRole}
                    onChange={(e) => onRoleChange(e.target.value)}
                    className="layout__role-select"
                  >
                    <option value={USER_ROLES.CLIENT}>
                      {t('common.client')}
                    </option>
                    <option value={USER_ROLES.ADMIN}>
                      {t('common.admin')}
                    </option>
                    <option value={USER_ROLES.SPECIALIST}>
                      {t('common.specialistRole')}
                    </option>
                  </select>
                </label>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="layout__main">
        <div className="layout__container">{children}</div>
      </main>

      <footer className="layout__footer">
        <div className="layout__container">
          <div className="layout__footer-grid">
            <div className="layout__footer-col">
              <h4>{t('footer.title')}</h4>
              <p>{t('footer.address')}</p>
              <p>{t('footer.hours')}</p>
            </div>
            <div className="layout__footer-col">
              <h4>{t('footer.contacts')}</h4>
              <p>📞 {t('footer.phone')}</p>
              <p>✉️ {t('footer.email')}</p>
            </div>
            <div className="layout__footer-col">
              <h4>{t('footer.online')}</h4>
              <p>{t('footer.onlineDesc')}</p>
              <p>{t('footer.copyright')}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
