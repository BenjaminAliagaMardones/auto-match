import '@testing-library/jest-dom';

const storage = {};
Object.defineProperty(globalThis, 'sessionStorage', {
  value: {
    getItem: (key) => storage[key] ?? null,
    setItem: (key, value) => {
      storage[key] = String(value);
    },
    removeItem: (key) => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach((k) => delete storage[k]);
    },
  },
  writable: true,
});
