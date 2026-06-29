/**
 * AdminDashboard.jsx — главная панель администратора
 *
 * Композиция stats, tabs, tables и modals; бизнес-логика — в useAdminDashboard.
 */
import { Calendar, Scissors, Users } from 'lucide-react';
import AdminStats from './AdminStats';
import AdminFilterPanel from './AdminFilterPanel';
import AdminBookingsTable from './AdminBookingsTable';
import AdminServicesList from './AdminServicesList';
import AdminSpecialistsList from './AdminSpecialistsList';
import ServiceModal from './ServiceModal';
import SpecialistModal from './SpecialistModal';
import BookingEditModal from './BookingEditModal';
import { useLanguage } from '../../hooks/useLanguage';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import './AdminDashboard.css';

export default function AdminDashboard({
  bookings,
  services,
  specialists,
  stats,
  onUpdateBooking,
  onCancelBooking,
  onAddService,
  onUpdateService,
  onDeleteService,
  onAddSpecialist,
  onUpdateSpecialist,
  onDeleteSpecialist,
}) {
  const { t } = useLanguage();

  const {
    activeTab,
    setActiveTab,
    filters,
    sortBy,
    sortedBookings,
    activeFiltersCount,
    serviceModal,
    specialistModal,
    editBookingModal,
    handleFilterChange,
    handleResetFilters,
    handleSortChange,
    handleEditBooking,
    handleSaveBooking,
    handleConfirmBooking,
    handleCancelBooking,
    handleOpenAddService,
    handleOpenEditService,
    handleSaveService,
    handleDeleteService,
    handleCloseServiceModal,
    handleOpenAddSpecialist,
    handleOpenEditSpecialist,
    handleSaveSpecialist,
    handleDeleteSpecialist,
    handleCloseSpecialistModal,
    handleCloseEditBookingModal,
  } = useAdminDashboard({
    bookings,
    services,
    specialists,
    onUpdateBooking,
    onCancelBooking,
    onAddService,
    onUpdateService,
    onDeleteService,
    onAddSpecialist,
    onUpdateSpecialist,
    onDeleteSpecialist,
  });

  const ADMIN_TABS = [
    { id: 'bookings', label: t('admin.tabs.bookings'), icon: Calendar },
    { id: 'services', label: t('admin.tabs.services'), icon: Scissors },
    { id: 'specialists', label: t('admin.tabs.specialists'), icon: Users },
  ];

  return (
    <div className="admin-dashboard">
      <AdminStats stats={stats} bookings={bookings} />

      <div className="admin-dashboard__tabs">
        {ADMIN_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`admin-dashboard__tab ${
              activeTab === id ? 'admin-dashboard__tab--active' : ''
            }`}
            onClick={() => setActiveTab(id)}
            aria-pressed={activeTab === id}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="admin-dashboard__content">
        {activeTab === 'bookings' && (
          <>
            <AdminFilterPanel
              filters={filters}
              sortBy={sortBy}
              specialists={specialists}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
              onReset={handleResetFilters}
              activeCount={activeFiltersCount}
            />
            <AdminBookingsTable
              bookings={sortedBookings}
              services={services}
              specialists={specialists}
              onEdit={handleEditBooking}
              onConfirm={handleConfirmBooking}
              onCancel={handleCancelBooking}
            />
          </>
        )}

        {activeTab === 'services' && (
          <AdminServicesList
            services={services}
            onOpenAdd={handleOpenAddService}
            onOpenEdit={handleOpenEditService}
            onDelete={handleDeleteService}
          />
        )}

        {activeTab === 'specialists' && (
          <AdminSpecialistsList
            specialists={specialists}
            services={services}
            onOpenAdd={handleOpenAddSpecialist}
            onOpenEdit={handleOpenEditSpecialist}
            onDelete={handleDeleteSpecialist}
          />
        )}
      </div>

      <ServiceModal
        isOpen={serviceModal.isOpen}
        mode={serviceModal.mode}
        service={serviceModal.service}
        specialists={specialists}
        existingServices={services}
        onSave={handleSaveService}
        onClose={handleCloseServiceModal}
      />

      <SpecialistModal
        isOpen={specialistModal.isOpen}
        mode={specialistModal.mode}
        specialist={specialistModal.specialist}
        services={services}
        existingSpecialists={specialists}
        onSave={handleSaveSpecialist}
        onClose={handleCloseSpecialistModal}
      />

      <BookingEditModal
        booking={editBookingModal.booking}
        services={services}
        specialists={specialists}
        bookings={bookings}
        isOpen={editBookingModal.isOpen}
        onClose={handleCloseEditBookingModal}
        onSave={handleSaveBooking}
      />
    </div>
  );
}
