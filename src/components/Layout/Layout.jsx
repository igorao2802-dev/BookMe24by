/**
 * Layout.jsx — компонент-обёртка (шапка, навигация, подвал)
 *
 * ПОЧЕМУ menuItems не объявлены здесь?
 * Единый конфиг src/config/navigation.js — один источник для Layout и AppRoutes.
 */

import { Link, useLocation } from 'react-router-dom';

import { USER_ROLES, APP_CONFIG } from '../../utils/constants.js';
import { getVisibleNavItems, ROUTE_PATHS } from '../../config/navigation';
import { getDefaultPathForRole } from '../../utils/roleRouting';
import ThemeToggle from '../UI/ThemeToggle';
import LanguageToggle from '../UI/LanguageToggle';
import SpecialistPicker from '../Specialist/SpecialistPicker';
import RoleSwitcher from './RoleSwitcher';
import { useLanguage } from '../../hooks/useLanguage';
import './Layout.css';

export default function Layout({ children, userRole, onRoleChange }) {
  const location = useLocation();
  const { t } = useLanguage();
  const showSpecialistPicker = userRole === USER_ROLES.SPECIALIST;

  const visibleMenu = getVisibleNavItems(userRole);
  const homePath = getDefaultPathForRole(userRole);

  const isNavItemActive = (itemPath) =>
    location.pathname === itemPath ||
    (itemPath !== ROUTE_PATHS.HOME &&
      location.pathname.startsWith(`${itemPath}/`));

  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__container">
          <div className="layout__brand">
            <Link to={homePath} className="layout__logo">
              💇♀️ <span>{t('common.brandName')}</span>
            </Link>
          </div>

          <nav className="layout__nav" aria-label={t('common.mainNavigation')}>
            {visibleMenu.map((item) => {
              const Icon = item.icon;
              const isActive = isNavItemActive(item.path);

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
            {APP_CONFIG.SHOW_DEMO_ROLE_SWITCHER && (
              <RoleSwitcher
                userRole={userRole}
                onRoleChange={onRoleChange}
              />
            )}
            <div className="layout__controls-group">
              <ThemeToggle />
              <LanguageToggle />
            </div>
            {showSpecialistPicker && <SpecialistPicker />}
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
              <p>
                ✉️{' '}
                <a
                  href={`mailto:${t('footer.email')}?subject=${encodeURIComponent(t('footer.emailSubject'))}`}
                  className="layout__footer-email"
                  aria-label={t('footer.emailAriaLabel', {
                    email: t('footer.email'),
                  })}
                >
                  {t('footer.email')}
                </a>
              </p>
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
