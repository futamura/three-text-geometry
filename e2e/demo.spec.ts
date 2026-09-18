import * as fs from 'fs';
import * as path from 'path';
import { expect, Page, test } from '@playwright/test';

/**
 * The scenes fetch their fonts from `raw.githubusercontent.com` on the `develop` branch. Serving
 * them from `tests/fonts` instead keeps the run offline and pins it to the working tree rather than
 * to whatever is on the branch. `route.fulfill` rather than `route.continue`, because Playwright
 * refuses to redirect a request to a different protocol.
 */
const RAW = 'https://raw.githubusercontent.com/futamura/three-text-geometry/develop/tests/fonts/';
const FONTS = path.resolve(__dirname, '../tests/fonts');

/**
 * Every route the demo serves. `/shader` and `/shuffleshader` build their material with `wgslFn`, so
 * it is raw WGSL and only compiles on the WebGPU backend — see the flags in playwright.config.ts.
 */
const ROUTES = ['/simple', '/shuffle', '/shader', '/shuffleshader', '/multipage'];

const CONTENT_TYPES: Record<string, string> = { '.png': 'image/png', '.json': 'application/json', '.xml': 'text/xml', '.bin': 'application/octet-stream' };

/**
 * Serves the font requests from the repository, or fails them when the scene should find nothing.
 *
 * @param {Page} page - The page to intercept on.
 * @param {boolean} serveFonts - False to 404 everything but the texture, which leaves the scene with no text to lay out.
 * @returns {Promise<void>} Resolves once the route is registered.
 */
async function routeFonts(page: Page, serveFonts: boolean): Promise<void> {
  await page.route(`${RAW}**`, (route) => {
    const name = route.request().url().slice(RAW.length);
    const file = path.join(FONTS, name);
    if (!serveFonts && !name.endsWith('.png')) return route.fulfill({ status: 404, body: 'not served' });
    if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: `missing ${name}` });
    return route.fulfill({ status: 200, headers: { 'content-type': CONTENT_TYPES[path.extname(name)] ?? 'text/plain' }, body: fs.readFileSync(file) });
  });
}

/**
 * The share of canvas pixels that are neither transparent nor black, as a percentage.
 *
 * The canvas is read back through a screenshot rather than `toDataURL`, which does not survive the
 * renderer's swap chain. The PNG is decoded by the page itself, so the test needs no image library.
 *
 * @param {Page} page - The page holding the canvas.
 * @returns {Promise<number>} The percentage of lit pixels, or 0 while no canvas has been painted.
 */
async function inkPercent(page: Page): Promise<number> {
  const canvas = await page.$('canvas');
  if (!canvas) return 0;
  const shot = await canvas.screenshot();
  return page.evaluate(async (base64) => {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = `data:image/png;base64,${base64}`;
    });
    const readback = document.createElement('canvas');
    readback.width = image.width;
    readback.height = image.height;
    const context = readback.getContext('2d')!;
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, readback.width, readback.height);
    let lit = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3]! > 8 && (data[i]! > 8 || data[i + 1]! > 8 || data[i + 2]! > 8)) lit++;
    }
    return (lit / (data.length / 4)) * 100;
  }, shot.toString('base64'));
}

/**
 * Opens a route and waits for its canvas to hold something.
 *
 * @param {Page} page - The page to navigate.
 * @param {string} route - The demo route.
 * @param {boolean} serveFonts - Whether the fonts should be served.
 * @returns {Promise<void>} Resolves once the scene has painted.
 */
async function openScene(page: Page, route: string, serveFonts: boolean): Promise<void> {
  await routeFonts(page, serveFonts);
  await page.goto(route);
  await page.waitForSelector('canvas');
  // An element screenshot captures what is composited over the canvas, and two overlays sit there:
  // stats.js mounts a `position: fixed` panel and the demo's own nav is a MUI Paper. Both are white,
  // and together they were 3.44% of the frame — most of what the floor used to measure. Hiding them
  // leaves the floor at the axes helper alone, which is a stable 0.84% on every route.
  await page.addStyleTag({ content: 'body * { visibility: hidden !important; } canvas { visibility: visible !important; }' });
  await expect.poll(() => inkPercent(page), { timeout: 30_000 }).toBeGreaterThan(0.5);
}

for (const route of ROUTES) {
  test(`${route} renders its text`, async ({ page, context }) => {
    // The floor is measured in the same run rather than hardcoded. `OrbitControls autoRotate` keeps
    // the camera moving, so the lit share drifts from frame to frame and a fixed threshold would be
    // measuring the sampling moment. With the fonts withheld only the axes helper is drawn: 0.89% on
    // every route, against 3.56% for the worst frame of the worst route once the text is there. The
    // multiplier sits between the two, so it also fails a scene that only lays out part of its text.
    const floorPage = await context.newPage();
    await openScene(floorPage, route, false);
    const floor = await inkPercent(floorPage);
    await floorPage.close();

    const errors: string[] = [];
    page.on('console', (message) => message.type() === 'error' && errors.push(`console: ${message.text()}`));
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));

    await openScene(page, route, true);

    // Passes as soon as the glyphs appear, so a slow machine costs time rather than a failure.
    await expect.poll(() => inkPercent(page), { timeout: 30_000 }).toBeGreaterThan(floor * 2);
    expect(errors).toEqual([]);
  });
}
