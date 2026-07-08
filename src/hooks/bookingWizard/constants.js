/**
 * constants.js — начальное состояние черновика записи
 *
 * ПОЧЕМУ отдельный файл?
 * Единая точка для reset/clear и useLocalStorage initialValue.
 */

export const INITIAL_BOOKING_DRAFT = {
  serviceId: null,
  specialistId: null,
  date: null,
  startTime: null,
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  comment: "",
};

export default INITIAL_BOOKING_DRAFT;
