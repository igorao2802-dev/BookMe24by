import "@testing-library/jest-dom";

// Мок для localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) =>
      Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
    ),
    setItem: jest.fn((key, value) => {
      if (value === undefined || value === null) return;
      store[key] = String(value);
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// jsdom может переопределить localStorage после setupTests — принудительно подменяем
window.localStorage = localStorageMock;
global.localStorage = localStorageMock;

// Мок generateId: nanoid v5 — ESM, Jest (CRA) не трансформирует node_modules по умолчанию
jest.mock("./utils/generateId", () => ({
  __esModule: true,
  default: jest.fn(() => "test_nanoid"),
  generateId: jest.fn(() => "test_nanoid"),
  generateServiceId: jest.fn(() => "custom_svc_test_nanoid"),
  generateSpecialistId: jest.fn(() => "custom_spec_test_nanoid"),
}));

// Мок для window.confirm
window.confirm = jest.fn(() => true);

// Мок для Toast
jest.mock("./components/UI/Toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
}));
