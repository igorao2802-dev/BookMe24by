/**
 * AppRoutes.jsx — декларативная карта маршрутов SPA bookme24
 *
 * АРХИТЕКТУРНАЯ РОЛЬ:
 * Содержит все пути приложения и правила передачи domain-state в страницы.
 * Пути и allowedRoles синхронизированы с src/config/navigation.js.
 *
 * ПОЧЕМУ React.lazy для admin/profile/catalog?
 * Code splitting уменьшает initial bundle — тяжёлые экраны грузятся
 * только при первом переходе на соответствующий URL.
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import Layout from './Layout/Layout';
import BookingWizard from './Booking/BookingWizard';
import AppLoading from './AppLoading';
import NotFoundPage from './NotFoundPage';
import ProtectedRoute from './ProtectedRoute';

import { ROUTE_PATHS, getNavItemByPath } from '../config/navigation';
import { USER_ROLES } from '../utils/constants';

const CatalogPage = lazy(() => import('./Catalog/CatalogPage'));
const AdminDashboard = lazy(() => import('./Admin/AdminDashboard'));
const ProfilePage = lazy(() => import('./Profile/ProfilePage'));
const SpecialistSchedulePage = lazy(
  () => import('./Specialist/SpecialistSchedulePage'),
);

/**
 * Оборачивает lazy-страницы в Suspense с единым fallback bootstrap-лоадера.
 */
function LazyRoute({ children }) {
  return <Suspense fallback={<AppLoading />}>{children}</Suspense>;
}

/**
 * @param {{
 *   salon: object,
 *   userRole: string,
 *   onRoleChange: Function,
 * }} props
 */
export default function AppRoutes({ salon, userRole, onRoleChange }) {
  const navigate = useNavigate();

  const adminNav = getNavItemByPath(ROUTE_PATHS.ADMIN);
  const profileNav = getNavItemByPath(ROUTE_PATHS.PROFILE);
  const specialistNav = getNavItemByPath(ROUTE_PATHS.SPECIALIST);

  return (
    <Layout userRole={userRole} onRoleChange={onRoleChange}>
      <Routes>
        <Route
          path={ROUTE_PATHS.HOME}
          element={
            <BookingWizard
              services={salon.services}
              specialists={salon.specialists}
              bookings={salon.bookings}
              onCreateBooking={salon.createBooking}
            />
          }
        />

        <Route
          path={ROUTE_PATHS.CATALOG}
          element={
            <LazyRoute>
              <CatalogPage
                services={salon.services}
                specialists={salon.specialists}
              />
            </LazyRoute>
          }
        />

        <Route
          path={ROUTE_PATHS.ADMIN}
          element={
            <ProtectedRoute
              allowedRoles={adminNav?.allowedRoles ?? [USER_ROLES.ADMIN]}
              userRole={userRole}
            >
              <LazyRoute>
                <AdminDashboard
                  bookings={salon.bookings}
                  services={salon.services}
                  specialists={salon.specialistsWithServices}
                  stats={salon.stats}
                  onUpdateBooking={salon.updateBooking}
                  onCancelBooking={salon.cancelBooking}
                  onAddService={salon.addService}
                  onUpdateService={salon.updateService}
                  onDeleteService={salon.deleteService}
                  onAddSpecialist={salon.addSpecialist}
                  onUpdateSpecialist={salon.updateSpecialist}
                  onDeleteSpecialist={salon.deleteSpecialist}
                />
              </LazyRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTE_PATHS.PROFILE}
          element={
            <ProtectedRoute
              allowedRoles={profileNav?.allowedRoles ?? [USER_ROLES.CLIENT]}
              userRole={userRole}
            >
              <LazyRoute>
                <ProfilePage
                  userRole={userRole}
                  bookings={salon.bookings}
                  services={salon.services}
                  specialists={salon.specialists}
                  onNewBooking={() => navigate(ROUTE_PATHS.HOME)}
                  onCancelBooking={salon.cancelBooking}
                  onRoleChange={onRoleChange}
                />
              </LazyRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTE_PATHS.SPECIALIST}
          element={
            <ProtectedRoute
              allowedRoles={
                specialistNav?.allowedRoles ?? [USER_ROLES.SPECIALIST]
              }
              userRole={userRole}
            >
              <LazyRoute>
                <SpecialistSchedulePage />
              </LazyRoute>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
