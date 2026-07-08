/**
 * SpecialistProfilePage.jsx — кабинет мастера: профиль и статистика
 */

import { useMemo } from 'react';
import { Briefcase, Star, User } from 'lucide-react';

import EmptyState from '../UI/EmptyState';
import SpecialistStats from './SpecialistStats';
import SpecialistServicesList from './SpecialistServicesList';
import { useLanguage } from '../../hooks/useLanguage';
import { useCurrentSpecialistContext } from '../../contexts/CurrentSpecialistContext';
import { getSpecialistServices } from '../../utils/specialistHelpers';
import './SpecialistProfilePage.css';

export default function SpecialistProfilePage({
  services,
  getSpecialistStats,
}) {
  const { t } = useLanguage();
  const { currentSpecialist, currentSpecialistId } =
    useCurrentSpecialistContext();

  const stats = useMemo(() => {
    if (!currentSpecialistId || !getSpecialistStats) {
      return null;
    }
    return getSpecialistStats(
      currentSpecialistId,
      services,
      currentSpecialist,
    );
  }, [
    currentSpecialistId,
    currentSpecialist,
    services,
    getSpecialistStats,
  ]);

  const specialistServices = useMemo(
    () => getSpecialistServices(services, currentSpecialist),
    [services, currentSpecialist],
  );

  if (!currentSpecialist || !stats) {
    return (
      <EmptyState
        icon={<User size={48} />}
        title={t('specialist.notFoundTitle')}
        description={t('specialist.notFoundDescription')}
        variant="info"
      />
    );
  }

  const initials = currentSpecialist.fullName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="specialist-profile-page">
      <header className="specialist-profile-page__header">
        <h1>{t('specialist.profileTitle')}</h1>
        <p className="specialist-profile-page__subtitle">
          {t('specialist.profileSubtitle')}
        </p>
      </header>

      <section className="specialist-profile-page__section">
        <h2 className="specialist-profile-page__section-title">
          {t('specialist.sections.profile')}
        </h2>
        <div className="specialist-profile-card">
          <div className="specialist-profile-card__avatar">{initials}</div>
          <div className="specialist-profile-card__info">
            <h3 className="specialist-profile-card__name">
              {currentSpecialist.fullName}
            </h3>
            <div className="specialist-profile-card__meta">
              <span className="specialist-profile-card__meta-item">
                <Briefcase size={16} aria-hidden="true" />
                {currentSpecialist.position}
              </span>
              <span className="specialist-profile-card__meta-item">
                <Star size={16} aria-hidden="true" />
                {t('specialist.experienceYears', {
                  years: currentSpecialist.experience,
                })}
              </span>
              <span className="specialist-profile-card__meta-item">
                <Star size={16} aria-hidden="true" />
                {t('specialist.ratingValue', {
                  rating: currentSpecialist.rating?.toFixed(1) ?? '—',
                })}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="specialist-profile-page__section">
        <h2 className="specialist-profile-page__section-title">
          {t('specialist.sections.stats')}
        </h2>
        <SpecialistStats stats={stats} />
        <p className="specialist-profile-page__stats-note">
          {t('specialist.statsNote', {
            pending: stats.pending,
            completed: stats.completed,
            cancelled: stats.cancelled,
          })}
        </p>
      </section>

      <section className="specialist-profile-page__section">
        <h2 className="specialist-profile-page__section-title">
          {t('specialist.sections.services')}
          <span className="specialist-profile-page__section-count">
            ({specialistServices.length})
          </span>
        </h2>
        <SpecialistServicesList services={specialistServices} />
      </section>
    </div>
  );
}
