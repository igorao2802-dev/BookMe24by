import {
  validateServiceField,
  validateAllServiceFields,
  validateServiceData,
  prepareServiceForSave,
} from "../utils/validateService";

const validFormData = {
  name: "Стрижка женская",
  category: "hair",
  description: "Классическая стрижка с укладкой и консультацией мастера",
  duration: "60",
  price: "45",
  specialistIds: [],
  nameEn: "",
  descriptionEn: "",
};

describe("validateService", () => {
  describe("validateServiceField", () => {
    test("отклоняет XSS в названии", () => {
      expect(
        validateServiceField("name", "Стрижка <script>", [], null),
      ).toBe("validation.xssDetected");
    });

    test("отклоняет отрицательную длительность", () => {
      expect(validateServiceField("duration", "-5", [], null)).toBe(
        "validation.service.durationTooShort",
      );
    });

    test("отклоняет пустое название", () => {
      expect(validateServiceField("name", "", [], null)).toBe(
        "validation.service.nameRequired",
      );
    });

    test("принимает валидное название", () => {
      expect(
        validateServiceField("name", validFormData.name, [], null),
      ).toBeNull();
    });
  });

  describe("validateAllServiceFields", () => {
    test("собирает ошибки по невалидной форме", () => {
      const errors = validateAllServiceFields(
        {
          ...validFormData,
          name: "Стрижка <script>",
          duration: "-5",
        },
        [],
        null,
      );

      expect(errors.name).toBe("validation.xssDetected");
      expect(errors.duration).toBe("validation.service.durationTooShort");
    });
  });

  describe("validateServiceData", () => {
    test("отклоняет XSS при сохранении через CRUD", () => {
      const result = validateServiceData(
        { ...validFormData, name: "Стрижка <script>" },
        [],
        null,
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe("validation.xssDetected");
    });

    test("отклоняет отрицательную длительность при сохранении через CRUD", () => {
      const result = validateServiceData(
        { ...validFormData, duration: -5 },
        [],
        null,
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.duration).toBe(
        "validation.service.durationTooShort",
      );
    });
  });

  describe("prepareServiceForSave", () => {
    test("санитизирует опасные символы после валидации", () => {
      const prepared = prepareServiceForSave(validFormData, [], null);

      expect(prepared.isValid).toBe(true);
      expect(prepared.data.name).toBe("Стрижка женская");
      expect(prepared.data.duration).toBe(60);
      expect(prepared.data.price).toBe(45);
    });

    test("не возвращает data при ошибках", () => {
      const prepared = prepareServiceForSave(
        { ...validFormData, name: "Стрижка <script>" },
        [],
        null,
      );

      expect(prepared.isValid).toBe(false);
      expect(prepared.data).toBeUndefined();
    });
  });
});
