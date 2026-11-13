import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    hookTimeout: 120_000,
    testTimeout: 20_000,
    // Tests never read .env -- it isn't in the repo, so a fresh clone or
    // the autograder wouldn't have one. They use this fixed secret instead.
    env: {
      JWT_SECRET: 'test-secret'
    }
  }
});
