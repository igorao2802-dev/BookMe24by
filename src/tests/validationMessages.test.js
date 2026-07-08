import { validateEmail, validateName } from "../utils/validators";
import {
  getEmailFormatErrorKey,
  VALIDATION_MESSAGE_KEYS,
} from "../utils/validationMessages";

describe("validationMessages", () => {
  describe("getEmailFormatErrorKey", () => {
    test.each([
      ["invalid-email", VALIDATION_MESSAGE_KEYS.email.noAt],
      ["test@", VALIDATION_MESSAGE_KEYS.email.noDomain],
      ["@mail.ru", VALIDATION_MESSAGE_KEYS.email.emptyLocal],
      ["test@mail", VALIDATION_MESSAGE_KEYS.email.noDomainDot],
      ["test@mail.c", VALIDATION_MESSAGE_KEYS.email.shortTld],
      ["user@domain.a", VALIDATION_MESSAGE_KEYS.email.shortTld],
      ["--dee@dd.g", VALIDATION_MESSAGE_KEYS.email.startsWithDash],
      [".user@mail.ru", VALIDATION_MESSAGE_KEYS.email.startsWithDot],
      ["user.@mail.ru", VALIDATION_MESSAGE_KEYS.email.endsWithInvalid],
      ["user..name@mail.ru", VALIDATION_MESSAGE_KEYS.email.consecutiveDots],
    ])("email %s → %s", (email, expectedKey) => {
      expect(getEmailFormatErrorKey(email)).toBe(expectedKey);
      expect(validateEmail(email).errorKey).toBe(expectedKey);
    });

    test("валидный email возвращает null из getEmailFormatErrorKey", () => {
      expect(getEmailFormatErrorKey("test@mail.ru")).toBeNull();
    });
  });

  describe("validateName tooShort params", () => {
    test("возвращает errorParams.min для короткого имени", () => {
      const result = validateName("А");
      expect(result.isValid).toBe(false);
      expect(result.errorKey).toBe(VALIDATION_MESSAGE_KEYS.name.tooShort);
      expect(result.errorParams).toEqual({ min: 2 });
    });
  });
});
