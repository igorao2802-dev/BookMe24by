/**
 * roleRouting.js — правила доступа к маршрутам по роли пользователя
 *
 * ПОЧЕМУ отдельный модуль?
 * Единые правила для ProtectedRoute, SpecialistAccessGuard и навигации —
 * без дублирования условий в Layout и AppRoutes.
 */

import { ROUTE_PATHS } from "../config/navigation";
import { USER_ROLES } from "./constants";

/** Маршруты, доступные только роли «Специалист» */
export const SPECIALIST_ALLOWED_PATHS = [
  ROUTE_PATHS.SPECIALIST_SCHEDULE,
  ROUTE_PATHS.SPECIALIST_PROFILE,
];

/**
 * Домашняя страница по роли (редирект при запрете доступа).
 * @param {string} userRole
 * @returns {string}
 */
export function getDefaultPathForRole(userRole) {
  switch (userRole) {
    case USER_ROLES.SPECIALIST:
      return ROUTE_PATHS.SPECIALIST_SCHEDULE;
    case USER_ROLES.ADMIN:
      return ROUTE_PATHS.ADMIN;
    case USER_ROLES.CLIENT:
    default:
      return ROUTE_PATHS.HOME;
  }
}

/**
 * Проверяет, может ли роль открыть pathname.
 * @param {string} pathname
 * @param {string} userRole
 * @returns {boolean}
 */
export function isPathAllowedForRole(pathname, userRole) {
  const normalizedPath =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  if (userRole === USER_ROLES.SPECIALIST) {
    if (normalizedPath === ROUTE_PATHS.SPECIALIST) {
      return true;
    }
    return SPECIALIST_ALLOWED_PATHS.some(
      (allowedPath) =>
        normalizedPath === allowedPath ||
        normalizedPath.startsWith(`${allowedPath}/`),
    );
  }

  if (
    normalizedPath === ROUTE_PATHS.SPECIALIST ||
    normalizedPath.startsWith(`${ROUTE_PATHS.SPECIALIST}/`)
  ) {
    return false;
  }

  return true;
}
