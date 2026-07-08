import { normalizePhone } from "../utils/formatters";

describe("formatters.normalizePhone", () => {
  test("удаляет все нецифровые символы", () => {
    expect(normalizePhone("+375 (29) 123-45-67")).toBe("375291234567");
  });

  test("возвращает пустую строку для пустого или невалидного ввода", () => {
    expect(normalizePhone("")).toBe("");
    expect(normalizePhone(null)).toBe("");
    expect(normalizePhone(undefined)).toBe("");
    expect(normalizePhone(123)).toBe("");
  });
});
