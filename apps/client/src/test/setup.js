import '@testing-library/jest-dom';

// jsdom no implementa scrollIntoView (usado por el chat)
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => {});

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
