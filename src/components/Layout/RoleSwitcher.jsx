/**
 * RoleSwitcher.jsx — демо-переключатель роли (Клиент / Админ / Специалист)
 *
 * ПОЧЕМУ отдельный компонент, а не inline в Layout?
 * Компактная разметка с иконкой одинаково работает на десктопе и на узких экранах,
 * без дублирования мобильных стилей в шапке.
 */

import { UserCog } from 'lucide-react';

import { USER_ROLES } from '../../utils/constants';
import { useLanguage } from '../../hooks/useLanguage';
import './RoleSwitcher.css';

const ROLE_OPTIONS = [
  { value: USER_ROLES.CLIENT, labelKey: 'common.client' },
  { value: USER_ROLES.ADMIN, labelKey: 'common.admin' },
  { value: USER_ROLES.SPECIALIST, labelKey: 'common.specialistRole' },
];

export default function RoleSwitcher({ userRole, onRoleChange }) {
  const { t } = useLanguage();

  const handleChange = (event) => {
    onRoleChange(event.target.value);
  };

  return (
    <div className="role-switcher">
      <label className="role-switcher__label" htmlFor="role-switcher-select">
        <UserCog
          className="role-switcher__icon"
          size={18}
          aria-hidden="true"
        />
        <span className="role-switcher__label-text">{t('common.role')}:</span>
        <select
          id="role-switcher-select"
          name="role-switcher"
          value={userRole}
          onChange={handleChange}
          className="role-switcher__select"
          aria-label={t('common.role')}
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
