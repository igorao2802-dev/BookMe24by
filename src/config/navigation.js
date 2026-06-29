/**
 * navigation.js — единый конфиг маршрутов и пунктов меню SPA
 *
 * АРХИТЕКТУРНАЯ РОЛЬ:
 * Один источник правды для URL, видимости в Header и прав доступа.
 * Layout фильтрует пункты по `roles`, AppRoutes — по `allowedRoles`.
 *
 * ПОЧЕМУ roles и allowedRoles разделены?
 * - roles — кто видит ссылку в навигации (UX по роли)
 * - allowedRoles — кто может открыть URL напрямую (guard через ProtectedRoute)
 * Для публичных страниц allowedRoles не задаётся.
 */

import {
  Calendar,
  BookOpen,
  LayoutDashboard,
  User,
  CalendarClock,
} from 'lucide-react';

import { USER_ROLES } from '../utils/constants';

/** Канонические пути — импортируются в AppRoutes без магических строк */
export const ROUTE_PATHS = {
  HOME: '/',
  CATALOG: '/catalog',
  ADMIN: '/admin',
  PROFILE: '/profile',
  SPECIALIST: '/specialist',
};

/**
 * @typedef {Object} NavigationItem
 * @property {string} path
 * @property {string} labelKey — ключ i18n (nav.*)
 * @property {string[]} roles — роли, для которых виден пункт меню
 * @property {import('lucide-react').LucideIcon} icon
 * @property {string[]} [allowedRoles] — если задано, маршрут защищён ProtectedRoute
 */

/** @type {NavigationItem[]} */
export const NAVIGATION_ITEMS = [
  {
    path: ROUTE_PATHS.HOME,
    labelKey: 'nav.booking',
    roles: [USER_ROLES.CLIENT, USER_ROLES.ADMIN, USER_ROLES.SPECIALIST],
    icon: Calendar,
  },
  {
    path: ROUTE_PATHS.CATALOG,
    labelKey: 'nav.catalog',
    roles: [USER_ROLES.CLIENT, USER_ROLES.ADMIN, USER_ROLES.SPECIALIST],
    icon: BookOpen,
  },
  {
    path: ROUTE_PATHS.ADMIN,
    labelKey: 'nav.manager',
    roles: [USER_ROLES.ADMIN],
    icon: LayoutDashboard,
    allowedRoles: [USER_ROLES.ADMIN],
  },
  {
    path: ROUTE_PATHS.SPECIALIST,
    labelKey: 'nav.specialist',
    roles: [USER_ROLES.SPECIALIST],
    icon: CalendarClock,
    allowedRoles: [USER_ROLES.SPECIALIST],
  },
  {
    path: ROUTE_PATHS.PROFILE,
    labelKey: 'nav.profile',
    roles: [USER_ROLES.CLIENT],
    icon: User,
    allowedRoles: [USER_ROLES.CLIENT],
  },
];

/**
 * Пункты меню, видимые текущей роли пользователя.
 * @param {string} userRole
 * @returns {NavigationItem[]}
 */
export function getVisibleNavItems(userRole) {
  return NAVIGATION_ITEMS.filter((item) => item.roles.includes(userRole));
}

/**
 * Метаданные маршрута по path (для guard и lazy-конфигурации).
 * @param {string} path
 * @returns {NavigationItem | undefined}
 */
export function getNavItemByPath(path) {
  return NAVIGATION_ITEMS.find((item) => item.path === path);
}

/**
 * Маршруты, требующие ProtectedRoute.
 * @returns {NavigationItem[]}
 */
export function getProtectedNavItems() {
  return NAVIGATION_ITEMS.filter((item) => item.allowedRoles?.length);
}

export default NAVIGATION_ITEMS;
