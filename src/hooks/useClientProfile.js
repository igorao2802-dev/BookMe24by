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

import { useState, useCallback, useMemo } from "react";

import { useLocalStorage } from "./useLocalStorage";
import { useLanguage } from "./useLanguage";
import Toast from "../components/UI/Toast";
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

  const resolvedPhone = useMemo(
    () => lastClientPhone || userSettings?.phone || "",
    [lastClientPhone, userSettings?.phone],
  );

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

  const toggleEdit = useCallback(() => {
    setEditDraft({
      phone: profile?.phone || userSettings?.phone || "",
      email: profile?.email || userSettings?.email || "",
    });
    setIsEditing(true);
  }, [profile, userSettings]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditDraft({ phone: "", email: "" });
  }, []);

  const handleUpdatePhone = useCallback((phone) => {
    setEditDraft((prev) => ({ ...prev, phone }));
  }, []);

  const handleUpdateEmail = useCallback((email) => {
    setEditDraft((prev) => ({ ...prev, email }));
  }, []);

  const saveSettings = useCallback(
    ({ phone, email }) => {
      const phoneResult = validatePhone(phone);
      if (!phoneResult.isValid) {
        Toast.error(t("profile.settings.validationError"));
        return { success: false, errors: { phone: phoneResult.errorKey } };
      }

      const emailResult = validateEmail(email);
      if (!emailResult.isValid) {
        Toast.error(t("profile.settings.validationError"));
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
    },
    [onUpdateSettings, userSettings, t],
  );

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
