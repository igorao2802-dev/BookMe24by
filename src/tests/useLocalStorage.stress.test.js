import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "../hooks/useLocalStorage";
describe("useLocalStorage — stress (race condition)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.localStorage.clear();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  test("10 быстрых functional updates → в storage записано последнее значение", () => {
    const { result } = renderHook(() =>
      useLocalStorage("counter", 0, { debounceMs: 0 }),
    );
    act(() => {
      for (let i = 0; i < 10; i += 1) {
        result.current[1]((prev) => prev + 1);
      }
    });
    expect(result.current[0]).toBe(10);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(window.localStorage.getItem("counter")).toBe(JSON.stringify(10));
  });
  test("10 быстрых functional updates с debounce → финальное значение после таймера", () => {
    const { result } = renderHook(() =>
      useLocalStorage("items", [], { debounceMs: 300 }),
    );
    act(() => {
      for (let i = 0; i < 10; i += 1) {
        result.current[1]((prev) => [...prev, `item-${i}`]);
      }
    });
    expect(result.current[0]).toHaveLength(10);
    expect(window.localStorage.getItem("items")).toBeNull();
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(window.localStorage.getItem("items")).toBe(
      JSON.stringify([
        "item-0",
        "item-1",
        "item-2",
        "item-3",
        "item-4",
        "item-5",
        "item-6",
        "item-7",
        "item-8",
        "item-9",
      ]),
    );
  });

  test("100 быстрых functional updates с debounce → финальное значение в storage", async () => {
    jest.useRealTimers();
    const { result } = renderHook(() =>
      useLocalStorage("test-key", 0, { debounceMs: 500 }),
    );

    act(() => {
      for (let i = 0; i < 100; i += 1) {
        result.current[1]((prev) => prev + 1);
      }
    });

    expect(result.current[0]).toBe(100);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    const storedValue = JSON.parse(window.localStorage.getItem("test-key"));
    expect(storedValue).toBe(100);
    jest.useFakeTimers();
  });
});
