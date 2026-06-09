import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'cobertura'],
      reportsDirectory: './coverage',
      // Cobertura de los módulos cubiertos por tests (se amplía al agregar más tests)
      include: [
        'src/services/auth.js',
        'src/features/feed/hooks/useBuyerFeed.js',
      ],
      exclude: [
        'src/test/**',
        'src/**/*.test.{js,jsx}',
      ],
    },
  },
});
