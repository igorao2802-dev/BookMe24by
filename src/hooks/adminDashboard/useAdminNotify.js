/**
 * useAdminNotify.js — единый паттерн success/error для CRUD админки
 *
 * ПОЧЕМУ отдельный хук?
 * Все handlers возвращают { success, error? }; notify инжектится из AdminDashboard.
 */

import { useCallback } from "react";
import { useLanguage } from "../useLanguage";
import { getNoopNotify } from "../../utils/createNotify.js";
import { ADMIN_TOAST_DURATION } from "./constants.js";

export function useAdminNotify(notifyProp) {
  const { t } = useLanguage();
  const notify = notifyProp ?? getNoopNotify();

  const notifySuccess = useCallback(
    (messageKey, params) => {
      notify.success(t(messageKey, params), {
        duration: ADMIN_TOAST_DURATION.success,
      });
    },
    [t, notify],
  );

  const notifyError = useCallback(
    (result) => {
      const errorMessage = result?.error ? t(result.error) : t("common.error");
      notify.error(errorMessage, { duration: ADMIN_TOAST_DURATION.error });
    },
    [t, notify],
  );

  return { notify, notifySuccess, notifyError, t };
}

export default useAdminNotify;
