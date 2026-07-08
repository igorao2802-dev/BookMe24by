/**
 * AppRoutes.jsx — декларативная карта маршрутов SPA bookme24
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

import Layout from './Layout/Layout';
import BookingWizard from './Booking/BookingWizard';
import AppLoading from './AppLoading';
import NotFoundPage from './NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
import SpecialistAccessGuard from './SpecialistAccessGuard';
import { CurrentSpecialistProvider } from '../contexts/CurrentSpecialistContext';

import { ROUTE_PATHS, getNavItemByPath } from '../config/navigation';
import { USER_ROLES } from '../utils/constants';
import { getDefaultPathForRole } from '../utils/roleRouting';

const CatalogPage = lazy(() => import('./Catalog/CatalogPage'));
const AdminDashboard = lazy(() => import('./Admin/AdminDashboard'));
const ProfilePage = lazy(() => import('./Profile/ProfilePage'));
const SpecialistSchedulePage = lazy(
  () => import('./Specialist/SpecialistSchedulePage'),
);
const SpecialistProfilePage = lazy(
  () => import('./Specialist/SpecialistProfilePage'),
);

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

  const homeNav = getNavItemByPath(ROUTE_PATHS.HOME);
  const catalogNav = getNavItemByPath(ROUTE_PATHS.CATALOG);
  const adminNav = getNavItemByPath(ROUTE_PATHS.ADMIN);
  const profileNav = getNavItemByPath(ROUTE_PATHS.PROFILE);
  const specialistScheduleNav = getNavItemByPath(
    ROUTE_PATHS.SPECIALIST_SCHEDULE,
  );
  const specialistProfileNav = getNavItemByPath(ROUTE_PATHS.SPECIALIST_PROFILE);

  const handleRoleChange = (nextRole) => {
    onRoleChange(nextRole);
    navigate(getDefaultPathForRole(nextRole));
  };

  return (
    <CurrentSpecialistProvider specialists={salon.specialists}>
      <Layout userRole={userRole} onRoleChange={handleRoleChange}>
        <SpecialistAccessGuard userRole={userRole}>
        <Routes>
          <Route
            path={ROUTE_PATHS.HOME}
            element={
              <ProtectedRoute
                allowedRoles={homeNav?.allowedRoles ?? [USER_ROLES.CLIENT, USER_ROLES.ADMIN]}
                userRole={userRole}
              >
                <BookingWizard
                  services={salon.services}
                  specialists={salon.specialists}
                  bookings={salon.bookings}
                  onCreateBooking={salon.createBooking}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTE_PATHS.CATALOG}
            element={
              <ProtectedRoute
                allowedRoles={
                  catalogNav?.allowedRoles ?? [USER_ROLES.CLIENT, USER_ROLES.ADMIN]
                }
                userRole={userRole}
              >
                <LazyRoute>
                  <CatalogPage
                    services={salon.services}
                    specialists={salon.specialists}
                  />
                </LazyRoute>
              </ProtectedRoute>
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
                    onClearHistory={salon.clearAllBookings}
                    onRoleChange={handleRoleChange}
                  />
                </LazyRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTE_PATHS.SPECIALIST}
            element={<Navigate to={ROUTE_PATHS.SPECIALIST_SCHEDULE} replace />}
          />

          <Route
            path={ROUTE_PATHS.SPECIALIST_SCHEDULE}
            element={
              <ProtectedRoute
                allowedRoles={
                  specialistScheduleNav?.allowedRoles ?? [USER_ROLES.SPECIALIST]
                }
                userRole={userRole}
              >
                <LazyRoute>
                  <SpecialistSchedulePage
                    bookings={salon.bookings}
                    services={salon.services}
                  />
                </LazyRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTE_PATHS.SPECIALIST_PROFILE}
            element={
              <ProtectedRoute
                allowedRoles={
                  specialistProfileNav?.allowedRoles ?? [USER_ROLES.SPECIALIST]
                }
                userRole={userRole}
              >
                <LazyRoute>
                  <SpecialistProfilePage
                    services={salon.services}
                    getSpecialistStats={salon.getSpecialistStats}
                  />
                </LazyRoute>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SpecialistAccessGuard>
    </Layout>
    </CurrentSpecialistProvider>
  );
}
