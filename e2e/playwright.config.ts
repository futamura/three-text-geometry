import { defineConfig, devices } from '@playwright/test';

/**
 * The demo is a separate package that depends on this one through `file:..`, which pnpm copies at
 * install time. So the library has to be built and the demo reinstalled before these run:
 *
 * ```sh
 * pnpm build
 * cd demo && pnpm install --force && pnpm build
 * cd .. && pnpm e2e
 * ```
 *
 * Chromium runs without a WebGPU flag on purpose. `--enable-unsafe-webgpu` does give the headless
 * browser an adapter, but every route then reports `WebGPU Device Lost` and paints an opaque
 * canvas. Without it `navigator.gpu` has no adapter, `THREE.WebGPURenderer` falls back to its WebGL
 * backend, and the scenes render cleanly.
 */
export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  timeout: 90_000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:4173',
    viewport: { width: 900, height: 700 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm --dir ../demo exec vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/simple',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
