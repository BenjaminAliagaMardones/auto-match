import '@testing-library/jest-dom';

// Mock sessionStorage para todos los tests
const storage = {};
Object.defineProperty(global, 'sessionStorage', {
  value: {
    getItem: (key) => storage[key] ?? null,
    setItem: (key, value) => { storage[key] = String(value); },
    removeItem: (key) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
  },
  writable: true,
});
