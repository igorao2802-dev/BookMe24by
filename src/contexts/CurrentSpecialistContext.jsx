/**
 * CurrentSpecialistContext.jsx — единый выбор мастера для роли «Специалист»
 *
 * ПОЧЕМУ Context, а не повторный useLocalStorage в каждом компоненте?
 * storage event не срабатывает в той же вкладке — Picker, расписание и профиль
 * жили в разных React-state и не синхронизировались при смене мастера.
 */

import { createContext, useContext } from 'react';

import { useCurrentSpecialist } from '../hooks/useCurrentSpecialist';

const CurrentSpecialistContext = createContext(null);

/**
 * @param {{ specialists: Array, children: React.ReactNode }} props
 */
export function CurrentSpecialistProvider({ specialists = [], children }) {
  const specialistState = useCurrentSpecialist(specialists);
  const value = {
    ...specialistState,
    specialists,
  };

  return (
    <CurrentSpecialistContext.Provider value={value}>
      {children}
    </CurrentSpecialistContext.Provider>
  );
}

/**
 * @returns {ReturnType<typeof useCurrentSpecialist>}
 */
export function useCurrentSpecialistContext() {
  const context = useContext(CurrentSpecialistContext);

  if (!context) {
    throw new Error(
      'useCurrentSpecialistContext must be used within CurrentSpecialistProvider',
    );
  }

  return context;
}

export default CurrentSpecialistContext;
