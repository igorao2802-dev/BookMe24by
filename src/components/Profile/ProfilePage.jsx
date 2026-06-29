/**
 * ProfilePage.jsx — Личный кабинет клиента
 *
 * Композиция секций профиля; бизнес-логика — в useClientProfile.
 */
import { useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Phone, Mail, CalendarPlus } from 'lucide-react';
import {
  USER_ROLES,
  BOOKING_STEPS,
  STORAGE_KEYS,
  STORAGE_DEBOUNCE_MS,
} from '../../utils/constants';
import { formatPhone, normalizePhone } from '../../utils/formatters';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useFavorites } from '../../hooks/useFavorites';
import { useLanguage } from '../../hooks/useLanguage';
import { useClientProfile } from '../../hooks/useClientProfile';
import { getProfileInitials } from '../../utils/profileHelpers';
import ProfileStats from './ProfileStats';
import BookingHistory from './BookingHistory';
import FavoritesSection from './FavoritesSection';
import SettingsForm from './SettingsForm';
import EmptyState from '../UI/EmptyState';
import Toast from '../UI/Toast';
import './ProfilePage.css';
function ProfilePageHeader({ title, subtitle }) {
  return (
    <div className="profile-page__header">
      <h1>{title}</h1>
      <p className="profile-page__subtitle">{subtitle}</p>
    </div>
  );
}

export default function ProfilePage({
  userRole,
  bookings,
  services,
  specialists,
  onNewBooking,
  onCancelBooking,
  onRoleChange,
}) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { favorites, toggle: handleToggleFavorite } = useFavorites();

  const [userSettings, setUserSettings] = useLocalStorage(
    STORAGE_KEYS.USER_SETTINGS,
    { phone: '', email: '' },
    { debounceMs: STORAGE_DEBOUNCE_MS.DEFAULT },
  );

  const handleUpdateSettings = useCallback(
    (updates) => setUserSettings((prev) => ({ ...prev, ...updates })),
    [setUserSettings],
  );

  const {
    profile,
    clientBookings,
    stats,
    isEditing,
    toggleEdit,
    resolvedPhone,
    ui: { editDraft, saveSettings, cancelEdit },
  } = useClientProfile({
    bookings,
    profileData: null,
    userSettings,
    onUpdateSettings: handleUpdateSettings,
  });

  const goToWizard = useCallback(
    (state) => navigate('/', { state }),
    [navigate],
  );

  const handleCancelBooking = (bookingId) => {
    const result = onCancelBooking(bookingId);
    if (result.success) {
      Toast.success(t('profile.bookings.cancelSuccess'));
    } else {
      Toast.error(result.error || t('profile.bookings.cancelError'));
    }
  };

  if (userRole !== USER_ROLES.CLIENT) {
    return <Navigate to="/" replace />;
  }

  const pageTitle = t('profile.title');
  const pageSubtitle = t('profile.subtitle');

  const showEmptyProfileState =
    !normalizePhone(resolvedPhone) && clientBookings.length === 0;

  const settingsSection = (
    <section className="profile-page__section">
      <h2 className="profile-page__section-title">{t('profile.sections.settings')}</h2>
      <SettingsForm
        settings={{ phone: userSettings.phone, email: userSettings.email }}
        isEditing={isEditing}
        editData={editDraft}
        onEdit={toggleEdit}
        onCancel={cancelEdit}
        onSave={saveSettings}
        onClearHistory={() => Toast.info(t('profile.settings.clearHistoryInfo'))}
        onLogout={() => {
          onRoleChange(USER_ROLES.CLIENT);
          navigate('/');
          Toast.success(t('profile.settings.logoutSuccess'));
        }}
      />
    </section>
  );

  if (showEmptyProfileState) {
    return (
      <div className="profile-page">
        <ProfilePageHeader title={pageTitle} subtitle={pageSubtitle} />
        <EmptyState
          icon={<Phone size={48} />}
          description={t('profile.emptyNoPhone.description')}
          actionLabel={t('profile.emptyNoPhone.action')}
          onAction={toggleEdit}
          variant="info"
        />
        {settingsSection}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <ProfilePageHeader title={pageTitle} subtitle={pageSubtitle} />
        <EmptyState
          icon={<CalendarPlus size={48} />}
          title={t('profile.empty.title')}
          description={t('profile.empty.description')}
          actionLabel={t('profile.empty.action')}
          onAction={onNewBooking}
          variant="info"
        />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <ProfilePageHeader title={pageTitle} subtitle={pageSubtitle} />

      <section className="profile-page__section">
        <h2 className="profile-page__section-title">{t('profile.sections.profile')}</h2>
        <div className="profile-card">
          <div className="profile-card__avatar">{getProfileInitials(profile.name)}</div>
          <div className="profile-card__info">
            <h3 className="profile-card__name">{profile.name}</h3>
            <div className="profile-card__contacts">
              <div className="profile-card__contact-item">
                <Phone size={16} className="profile-card__contact-icon" />
                <span>{formatPhone(profile.phone)}</span>
              </div>
              {profile.email && (
                <div className="profile-card__contact-item">
                  <Mail size={16} className="profile-card__contact-icon" />
                  <span>{profile.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="profile-page__section">
        <h2 className="profile-page__section-title">{t('profile.sections.stats')}</h2>
        <ProfileStats stats={stats} />
      </section>

      <section className="profile-page__section">
        <h2 className="profile-page__section-title">{t('profile.sections.bookings')}</h2>
        <BookingHistory
          bookings={clientBookings}
          services={services}
          specialists={specialists}
          onCancel={handleCancelBooking}
          onRebook={(booking) =>
            goToWizard({
              preselectedServiceId: booking.serviceId,
              preselectedSpecialistId: booking.specialistId,
              startStep: BOOKING_STEPS.DATETIME,
            })
          }
        />
      </section>

      <FavoritesSection
        hideMainTitle={true}
        services={services}
        specialists={specialists}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onBookService={(serviceId) =>
          goToWizard({
            preselectedServiceId: serviceId,
            startStep: BOOKING_STEPS.SPECIALIST,
          })
        }
        onBookSpecialist={(specialistId) =>
          goToWizard({
            preselectedSpecialistId: specialistId,
            startStep: BOOKING_STEPS.SPECIALIST,
          })
        }
      />

      <section className="profile-page__section">
        <h2 className="profile-page__section-title">{t('profile.sections.settings')}</h2>
        <SettingsForm
          settings={{ phone: profile.phone, email: profile.email }}
          isEditing={isEditing}
          editData={editDraft}
          onEdit={toggleEdit}
          onCancel={cancelEdit}
          onSave={saveSettings}
          onClearHistory={() => Toast.info(t('profile.settings.clearHistoryInfo'))}
          onLogout={() => {
            onRoleChange(USER_ROLES.CLIENT);
            navigate('/');
            Toast.success(t('profile.settings.logoutSuccess'));
          }}
        />
      </section>
    </div>
  );
}
