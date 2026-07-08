import {
  formatPartialByPhone,
  getDigitIndexFromCursor,
  getCursorFromDigitIndex,
  processPhoneInput,
} from "../utils/phoneInputHelpers";

describe("phoneInputHelpers", () => {
  test("formatPartialByPhone форматирует по мере ввода", () => {
    expect(formatPartialByPhone("375")).toBe("+375");
    expect(formatPartialByPhone("37529")).toBe("+375 (29");
    expect(formatPartialByPhone("375291234567")).toBe("+375 (29) 123-45-67");
  });

  test("курсор остаётся в зоне кода оператора при замене 20 → 29", () => {
    const before = "+375 (20) 123-45-67";
    const editing = "+375 (29) 123-45-67";
    const cursorAfterEdit = 8;

    const digitIndex = getDigitIndexFromCursor(editing, cursorAfterEdit);
    const { formatted, cursorPos } = processPhoneInput(editing, cursorAfterEdit);

    expect(formatted).toBe("+375 (29) 123-45-67");
    expect(cursorPos).toBe(getCursorFromDigitIndex(formatted, digitIndex));
    expect(cursorPos).toBeLessThan(formatted.length);
    expect(cursorPos).toBeGreaterThan(6);
  });

  test("processPhoneInput не отправляет курсор в конец при правке середины", () => {
    const value = "+375 (20) 123-45-67";
    const cursorInOperator = 7;
    const userValue =
      value.slice(0, cursorInOperator) + "9" + value.slice(cursorInOperator + 1);

    const { formatted, cursorPos } = processPhoneInput(
      userValue,
      cursorInOperator + 1,
    );

    expect(formatted).toContain("(29");
    expect(cursorPos).toBeLessThan(formatted.length - 5);
  });
});
