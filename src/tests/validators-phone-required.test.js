import { validatePhone } from "../utils/validators";

describe("Валидация телефона с required", () => {
  test('validatePhone("") с required: true должно возвращать isValid: false', () => {
    const result = validatePhone("", { required: true });
    expect(result.isValid).toBe(false);
    expect(result.errorKey).toBe("validation.phone.required");
  });

  test('validatePhone("") с required: false должно возвращать isValid: true', () => {
    const result = validatePhone("", { required: false });
    expect(result.isValid).toBe(true);
    expect(result.errorKey).toBeNull();
  });

  test('validatePhone("+375291234567") должно возвращать isValid: true', () => {
    const result = validatePhone("+375291234567", { required: true });
    expect(result.isValid).toBe(true);
    expect(result.errorKey).toBeNull();
  });
});
