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
 * Chromium is launched with WebGPU on a software Vulkan device, which is what the demo actually
 * uses: `DemoPage` builds a `THREE.WebGPURenderer`. All four flags are needed together.
 * `--enable-unsafe-webgpu` alone yields an adapter whose canvas reads back fully transparent — a
 * minimal clear-to-green page proves it — and the demo then reports `WebGPU Device Lost` on every
 * route. Adding the Vulkan SwiftShader flags makes the same page read back green and every route
 * render with no console errors at all.
 *
 * Without any of them `navigator.gpu` has no adapter and `WebGPURenderer` falls back to its WebGL
 * backend. That path works for the scenes with ordinary materials, but not for the two whose
 * material comes from `wgslFn`, since raw WGSL cannot compile there.
 */
export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  // Three condition-based waits per test, each with its own generous limit, so this has to clear
  // their sum. Nothing here sleeps: a healthy route finishes in 5 to 9 seconds.
  timeout: 180_000,
  use: {
    ...devices['Desktop Chrome'],
    launchOptions: {
      args: ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader', '--use-angle=swiftshader'],
    },
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
