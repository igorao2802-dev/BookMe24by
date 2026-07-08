import {
  validateRequired,
  validatePhone,
  validateEmail,
  validateName,
  validatePrice,
  validateDuration,
  validateComment,
  validateDate,
  validateTime,
  validateSearchQuery,
  sanitizeInput,
} from "../utils/validators";
import {
  sanitizeString,
  sanitizeObject,
  hasXSSPattern,
} from "../utils/sanitizers";
import {
  parseValidNumber,
  clampNumber,
  isReasonableNumber,
} from "../utils/numberHelpers";

describe("validators.comprehensive", () => {
  describe("validateRequired", () => {
    test.each([
      [null, false],
      [undefined, false],
      ["", false],
      ["   ", false],
    ])("отклоняет пустое значение %p", (value, expected) => {
      expect(validateRequired(value).valid).toBe(expected);
    });

    test.each([
      ["text", true],
      [0, true],
      [false, true],
    ])("принимает значение %p", (value, expected) => {
      expect(validateRequired(value).valid).toBe(expected);
    });

    test("required=false пропускает пустую строку", () => {
      expect(validateRequired("", { required: false }).valid).toBe(true);
    });
  });

  describe("validatePhone", () => {
    test("валидный номер +375291234567", () => {
      expect(validatePhone("+375291234567").valid).toBe(true);
    });

    test("валидный форматированный номер", () => {
      expect(validatePhone("+375 (29) 123-45-67").valid).toBe(true);
    });

    test("неверный код оператора", () => {
      const r = validatePhone("+375121234567");
      expect(r.valid).toBe(false);
      expect(r.errorKey).toBe("validation.phone.invalidCode");
    });

    test("короткий номер", () => {
      expect(validatePhone("+37529123456").valid).toBe(false);
    });

    test("пустой с required:true", () => {
      const r = validatePhone("", { required: true });
      expect(r.valid).toBe(false);
      expect(r.errorKey).toBe("validation.phone.required");
    });

    test("пустой с required:false", () => {
      expect(validatePhone("", { required: false }).valid).toBe(true);
    });

    test("XSS в телефоне", () => {
      expect(validatePhone("<script>alert(1)</script>").valid).toBe(false);
    });

    test("SQL-инъекция в телефоне", () => {
      expect(validatePhone("+375291234567; DROP TABLE").valid).toBe(false);
    });
  });

  describe("validateEmail", () => {
    test("пустая строка валидна", () => {
      expect(validateEmail("").valid).toBe(true);
    });

    test.each(["test@mail.ru", "user.name@domain.com"])(
      "валидный email %s",
      (email) => {
        expect(validateEmail(email).valid).toBe(true);
      },
    );

    test.each([
      ["test@", "validation.email.noDomain"],
      ["@mail.ru", "validation.email.emptyLocal"],
      ["test@mail", "validation.email.noDomainDot"],
      ["invalid-email", "validation.email.noAt"],
      ["test@mail.c", "validation.email.shortTld"],
      ["user@domain.a", "validation.email.shortTld"],
    ])("невалидный email %s → %s", (email, expectedKey) => {
      const result = validateEmail(email);
      expect(result.valid).toBe(false);
      expect(result.errorKey).toBe(expectedKey);
    });

    test("XSS в email", () => {
      expect(validateEmail("<script>@mail.ru").valid).toBe(false);
    });

    test("длина > 254", () => {
      const long = `${"a".repeat(250)}@mail.ru`;
      expect(validateEmail(long).valid).toBe(false);
    });
  });

  describe("validateName", () => {
    test.each(["Иван", "Иван Иванов", "Анна-Мария"])(
      "валидное имя %s",
      (name) => {
        expect(validateName(name).valid).toBe(true);
      },
    );

    test.each(["A", "123", "<script>", "Иван123"])(
      "невалидное имя %s",
      (name) => {
        expect(validateName(name).valid).toBe(false);
      },
    );

    test("длина > 100", () => {
      expect(validateName("А".repeat(101)).valid).toBe(false);
    });
  });

  describe("validatePrice", () => {
    test.each([100, 0, 9999])("валидная цена %p", (price) => {
      expect(validatePrice(price).valid).toBe(true);
    });

    test.each([-1, "abc", Infinity])(
      "невалидная цена %p",
      (price) => {
        expect(validatePrice(price, { allowZero: false, max: 10000 }).valid).toBe(
          false,
        );
      },
    );

    test("цена выше лимита салона", () => {
      expect(validatePrice(10001, { max: 10000 }).valid).toBe(false);
    });

    test('строка "100" парсится', () => {
      expect(validatePrice("100").valid).toBe(true);
    });

    test("цена 0 с allowZero:false", () => {
      expect(validatePrice(0, { allowZero: false }).valid).toBe(false);
    });
  });

  describe("validateDuration", () => {
    test.each([15, 30, 60, 480])("валидная длительность %p", (d) => {
      expect(validateDuration(d, { step: 0 }).valid).toBe(true);
    });

    test.each([0, 4, 481, 15.5, -10])(
      "невалидная длительность %p",
      (d) => {
        expect(validateDuration(d, { step: 0 }).valid).toBe(false);
      },
    );
  });

  describe("validateComment", () => {
    test("текст до 500 символов", () => {
      expect(validateComment("a".repeat(500)).valid).toBe(true);
    });

    test("> 500 символов", () => {
      expect(validateComment("a".repeat(501)).valid).toBe(false);
    });

    test("<script> отклоняется", () => {
      expect(validateComment("<script>").valid).toBe(false);
    });

    test("пустой с required:false", () => {
      expect(validateComment("").valid).toBe(true);
    });
  });

  describe("validateDate", () => {
    test("дата в будущем валидна", () => {
      const future = new Date();
      future.setDate(future.getDate() + 7);
      expect(validateDate(future.toISOString().slice(0, 10)).valid).toBe(true);
    });

    test("дата в прошлом невалидна", () => {
      expect(validateDate("2020-01-01").valid).toBe(false);
    });
  });

  describe("validateTime", () => {
    test("10:00 в рабочем дне", () => {
      expect(validateTime("10:00").valid).toBe(true);
    });

    test("08:00 вне рабочего дня", () => {
      expect(validateTime("08:00").valid).toBe(false);
    });

    test("10:07 не кратно 15", () => {
      expect(validateTime("10:07", { step: 15 }).valid).toBe(false);
    });
  });

  describe("validateSearchQuery", () => {
    test("обычный запрос", () => {
      expect(validateSearchQuery("стрижка").valid).toBe(true);
    });

    test("XSS в поиске", () => {
      expect(validateSearchQuery("<script>").valid).toBe(false);
    });

    test("слишком длинный запрос", () => {
      expect(validateSearchQuery("a".repeat(101)).valid).toBe(false);
    });
  });

  describe("processSearchInput", () => {
    test("обрезает ввод до 100 символов", () => {
      const { processSearchInput, SEARCH_INPUT_MAX } = require("../utils/searchInputHelpers");
      const long = "k".repeat(200);
      const { value } = processSearchInput(long);
      expect(value.length).toBe(SEARCH_INPUT_MAX);
      expect(SEARCH_INPUT_MAX).toBe(100);
    });
  });

  describe("sanitizeInput / sanitizers", () => {
    test("удаляет опасные символы", () => {
      expect(sanitizeInput('<>"\';&|`$')).toBe("");
    });

    test("sanitizeNameInput отсекает цифры и спецсимволы", () => {
      const { sanitizeNameInput } = require("../utils/sanitizers");
      expect(sanitizeNameInput("Иван555==--*[{")).toBe("Иван--");
      expect(sanitizeNameInput("Anna-Marie O'Brien")).toBe("Anna-Marie O'Brien");
    });

    test("null/undefined без ошибок", () => {
      expect(sanitizeString(null)).toBe("");
      expect(sanitizeString(undefined)).toBe("");
    });

    test("sanitizeObject рекурсивно", () => {
      const result = sanitizeObject({
        name: "<b>Иван</b>",
        nested: { note: "ok" },
      });
      expect(result.name).toBe("bИван/b");
      expect(result.nested.note).toBe("ok");
    });
  });

  describe("XSS-тесты", () => {
    const payloads = [
      "<script>alert(1)</script>",
      '<img src=x onerror=alert(1)>',
      "javascript:alert(1)",
      '"><script>alert(1)</script>',
      '{{constructor.constructor("alert(1)")()}}',
    ];

    test.each(payloads)("hasXSSPattern обнаруживает %s", (payload) => {
      expect(hasXSSPattern(payload)).toBe(true);
      const cleaned = sanitizeString(payload);
      expect(cleaned).not.toMatch(/[<>"';&|`$]/);
    });
  });

  describe("numberHelpers", () => {
    test("parseValidNumber отклоняет e и несколько точек", () => {
      expect(parseValidNumber("1e5")).toBeNull();
      expect(parseValidNumber("12.34.56")).toBeNull();
      expect(parseValidNumber("100")).toBe(100);
    });

    test("clampNumber", () => {
      expect(clampNumber(150, 0, 100)).toBe(100);
      expect(clampNumber(-5, 0, 100)).toBe(0);
    });

    test("isReasonableNumber", () => {
      expect(isReasonableNumber(50, { min: 0, max: 100 })).toBe(true);
      expect(isReasonableNumber(150, { min: 0, max: 100 })).toBe(false);
    });
  });

  describe("Edge-cases", () => {
    test("очень длинная строка в comment", () => {
      expect(validateComment("x".repeat(10000)).valid).toBe(false);
    });

    test("Unicode в имени", () => {
      expect(validateName("你好").valid).toBe(false);
    });

    test("эмодзи в комментарии допустимы", () => {
      expect(validateComment("😀🎉").valid).toBe(true);
    });

    test("переводы строк в комментарии", () => {
      expect(validateComment("строка1\nстрока2").valid).toBe(true);
    });
  });
});
