/**
 * serviceFormHelpers.js — утилиты ввода для ServiceForm
 */

import { PRICE_LIMITS } from "./constants";
import { sanitizeNumberInput } from "./sanitizers";

/** Блокирует дробные и экспоненциальные символы в number-input */
export function blockDecimalKeypress(e) {
  if (
    e.key === "." ||
    e.key === "," ||
    e.key === "e" ||
    e.key === "E" ||
    e.key === "-" ||
    e.key === "+"
  ) {
    e.preventDefault();
  }
}

/**
 * Нормализует целочисленный ввод: только неотрицательные цифры.
 * ПОЧЕМУ на onChange, а не только на submit?
 * Браузерный type=number допускает вставку «-5» и «e» — отсекаем сразу.
 */
export function createPositiveIntegerChangeHandler(onValueChange, max) {
  return (e) => {
    let value = sanitizeNumberInput(e.target.value, {
      allowNegative: false,
      integerOnly: true,
    });
    if (max !== undefined && value !== "" && Number(value) > max) {
      value = String(max);
    }
    onValueChange(value);
  };
}

/** Нормализует цену: только цифры, без ведущих нулей, cap по MAX */
export function createPriceChangeHandler(
  onValueChange,
  max = PRICE_LIMITS.ABSOLUTE_MAX,
) {
  return (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 1 && value.startsWith("0")) {
      value = value.replace(/^0+/, "") || "0";
    }
    if (Number(value) > max) {
      value = String(max);
    }
    onValueChange(value);
  };
}

export const INITIAL_SERVICE_FORM_DATA = {
  name: "",
  category: "",
  description: "",
  duration: "",
  price: "",
  specialistIds: [],
  nameEn: "",
  descriptionEn: "",
};
