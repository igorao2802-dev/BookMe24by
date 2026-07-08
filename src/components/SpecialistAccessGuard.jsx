/**
 * SpecialistAccessGuard.jsx — глобальный guard для роли «Специалист»
 *
 * ПОЧЕМУ отдельно от ProtectedRoute?
 * Публичные маршруты (/, /catalog) не обёрнуты в ProtectedRoute,
 * но специалисту на них вход запрещён — редирект на расписание.
 */

import { Navigate, useLocation } from "react-router-dom";

import { ROUTE_PATHS } from "../config/navigation";
import { USER_ROLES } from "../utils/constants";
import { isPathAllowedForRole } from "../utils/roleRouting";

/**
 * @param {{ userRole: string, children: React.ReactNode }} props
 */
export default function SpecialistAccessGuard({ userRole, children }) {
  const { pathname } = useLocation();

  if (userRole === USER_ROLES.SPECIALIST) {
    if (pathname === ROUTE_PATHS.SPECIALIST) {
      return <Navigate to={ROUTE_PATHS.SPECIALIST_SCHEDULE} replace />;
    }

    if (!isPathAllowedForRole(pathname, userRole)) {
      return <Navigate to={ROUTE_PATHS.SPECIALIST_SCHEDULE} replace />;
    }
  }

  return children;
}
