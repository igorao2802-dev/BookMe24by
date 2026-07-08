/**
 * SpecialistPicker.jsx — выбор текущего мастера в демо-режиме
 *
 * ПОЧЕМУ в шапке, а не только в профиле?
 * Выбор через CurrentSpecialistContext сразу обновляет расписание и кабинет.
 */

import { useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useCurrentSpecialistContext } from '../../contexts/CurrentSpecialistContext';
import './SpecialistPicker.css';

export default function SpecialistPicker() {
  const { t } = useLanguage();
  const { currentSpecialistId, setCurrentSpecialistId, specialists } =
    useCurrentSpecialistContext();

  const sortedSpecialists = useMemo(
    () =>
      [...specialists].sort((a, b) =>
        a.fullName.localeCompare(b.fullName, 'ru', { sensitivity: 'base' }),
      ),
    [specialists],
  );

  if (sortedSpecialists.length === 0) {
    return null;
  }

  const handleChange = (event) => {
    setCurrentSpecialistId(event.target.value);
  };

  return (
    <div className="specialist-picker">
      <label className="specialist-picker__label" htmlFor="specialist-picker">
        {t('specialist.selectMaster')}:
        <select
          id="specialist-picker"
          name="specialist-picker"
          value={currentSpecialistId}
          onChange={handleChange}
          className="specialist-picker__select"
          aria-label={t('specialist.selectMaster')}
        >
          {sortedSpecialists.map((specialist) => (
            <option key={specialist.id} value={specialist.id}>
              {specialist.fullName}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
