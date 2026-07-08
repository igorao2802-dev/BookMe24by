/**
 * useClientProfile.js — бизнес-логика личного кабинета (Фаза 7, H.2)
 *
 * АРХИТЕКТУРНАЯ РОЛЬ:
 * Изолирует фильтрацию записей, статистику, merge профиля и edit-mode
 * от JSX ProfilePage. Компонент остаётся composition секций.
 *
 * ПОЧЕМУ lastClientPhone внутри хука, а userSettings снаружи?
 * LAST_CLIENT_PHONE — ключ persistence (Фаза 4), нужен для filterClientBookings.
 * USER_SETTINGS приходит через props/callback — owner localStorage в ProfilePage.
 *
 * ПУБЛИЧНЫЙ API (Frozen Core — не менять без согласования):
 * profile, clientBookings, stats, isEditing, toggleEdit,
 * handleUpdatePhone, handleUpdateEmail, resolvedPhone
 */

import { useState, useMemo } from "react";

import { useLocalStorage } from "./useLocalStorage";
import { useLanguage } from "./useLanguage";
import { STORAGE_KEYS, STORAGE_DEBOUNCE_MS } from "../utils/constants";
import { validatePhone, validateEmail } from "../utils/validators";
import {
  filterClientBookings,
  computeClientStats,
  deriveProfileData,
} from "../utils/profileHelpers";

/**
 * Базовый профиль из последней записи клиента (до merge userSettings).
 *
 * @param {Array} clientBookings
 * @param {Function} t
 * @returns {Object|null}
 */
function buildProfileFromBookings(clientBookings, t) {
  if (!clientBookings.length) return null;

  const sorted = [...clientBookings].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB - dateA;
  });

  const latest = sorted[0];

  return {
    name: latest.clientName || t("profile.profile.defaultName"),
    phone: latest.clientPhone || "",
    email: latest.clientEmail || "",
  };
}

/**
 * @param {{
 *   bookings: Array,
 *   profileData: Object|null,
 *   userSettings: { phone?: string, email?: string },
 *   onUpdateSettings: Function,
 * }} params
 */
export function useClientProfile({
  bookings,
  profileData,
  userSettings,
  onUpdateSettings,
}) {
  const { t } = useLanguage();

  const [lastClientPhone] = useLocalStorage(
    STORAGE_KEYS.LAST_CLIENT_PHONE,
    "",
    { debounceMs: STORAGE_DEBOUNCE_MS.IMMEDIATE },
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState({ phone: "", email: "" });

  const resolvedPhone = lastClientPhone || userSettings?.phone || "";

  // ПОЧЕМУ useMemo: filterClientBookings проходит весь массив bookings
  const clientBookings = useMemo(
    () => filterClientBookings(bookings, lastClientPhone),
    [bookings, lastClientPhone],
  );

  const stats = useMemo(
    () => computeClientStats(clientBookings),
    [clientBookings],
  );

  const baseProfileData = useMemo(() => {
    if (profileData) return profileData;
    return buildProfileFromBookings(clientBookings, t);
  }, [profileData, clientBookings, t]);

  const profile = useMemo(
    () => deriveProfileData(baseProfileData, userSettings),
    [baseProfileData, userSettings],
  );

  const toggleEdit = () => {
    setEditDraft({
      phone: profile?.phone || userSettings?.phone || "",
      email: profile?.email || userSettings?.email || "",
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditDraft({ phone: "", email: "" });
  };

  const handleUpdatePhone = (phone) => {
    setEditDraft((prev) => ({ ...prev, phone }));
  };

  const handleUpdateEmail = (email) => {
    setEditDraft((prev) => ({ ...prev, email }));
  };

  const saveSettings = ({ phone, email }) => {
      // ПОЧЕМУ без Toast?
      // Валидация и уведомления — ответственность SettingsForm (UI-слой).
      const phoneResult = validatePhone(phone);
      if (!phoneResult.isValid) {
        return { success: false, errors: { phone: phoneResult.errorKey } };
      }

      const emailResult = validateEmail(email);
      if (!emailResult.isValid) {
        return { success: false, errors: { email: emailResult.errorKey } };
      }

      onUpdateSettings({
        ...userSettings,
        phone,
        email,
      });
      setIsEditing(false);
      setEditDraft({ phone: "", email: "" });
      return { success: true };
  };

  return {
    profile,
    clientBookings,
    stats,
    isEditing,
    toggleEdit,
    handleUpdatePhone,
    handleUpdateEmail,
    resolvedPhone,
    ui: {
      editDraft,
      saveSettings,
      cancelEdit,
    },
  };
}

export default useClientProfile;
