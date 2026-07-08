/**
 * ProtectedRoute.jsx — guard маршрутов по роли пользователя
 *
 * АРХИТЕКТУРНАЯ РОЛЬ:
 * В react-router-dom v6 нет встроенного PrivateRoute — проверка роли
 * выполняется через условный рендер. Компонент переиспользуется для
 * админ-панели (роль admin / «менеджер» в UI) и личного кабинета клиента.
 *
 * ПОЧЕМУ redirect на "/" вместо страницы 403?
 * В демо-приложении курсового проекта нет отдельного экрана «доступ запрещён»;
 * мягкий редирект на публичную запись не раскрывает защищённые URL.
 */

import { Navigate } from 'react-router-dom';

import { getDefaultPathForRole } from '../utils/roleRouting';

/**
 * @param {{
 *   allowedRoles: string | string[],
 *   userRole: string,
 *   children: React.ReactNode,
 *   redirectTo?: string,
 * }} props
 */
export default function ProtectedRoute({
  allowedRoles,
  userRole,
  children,
  redirectTo,
}) {
  const rolesList = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles];

  const isAllowed = rolesList.includes(userRole);

  if (!isAllowed) {
    const fallback = redirectTo ?? getDefaultPathForRole(userRole);
    return <Navigate to={fallback} replace />;
  }

  return children;
}
