import * as fs from 'fs';
import * as path from 'path';
import { expect, Page } from '@playwright/test';

/**
 * The scenes fetch their fonts from `raw.githubusercontent.com` on the `develop` branch. Serving
 * them from `tests/fonts` instead keeps the run offline and pins it to the working tree rather than
 * to whatever is on the branch. `route.fulfill` rather than `route.continue`, because Playwright
 * refuses to redirect a request to a different protocol.
 */
export const RAW = 'https://raw.githubusercontent.com/futamura/three-text-geometry/develop/tests/fonts/';

/** The directory the intercepted requests are served from. */
export const FONTS = path.resolve(__dirname, '../tests/fonts');

/**
 * How long a wait may take before it is treated as a failure rather than a slow machine. Every wait
 * here polls, so this costs nothing on a healthy run: a route settles in 5 to 9 seconds. It is
 * generous because `demo-smoke` blocks merges, and because the cost of it being too low is a red
 * check on work that is fine. Measured over eight local runs, the slowest route took 18.7s while
 * the machine was busy, so 30s left only 1.6x of room.
 */
export const WAIT = 60_000;

const CONTENT_TYPES: Record<string, string> = { '.png': 'image/png', '.json': 'application/json', '.xml': 'text/xml', '.bin': 'application/octet-stream' };

/**
 * Serves the font requests from the repository, or fails them when the scene should find nothing.
 *
 * The returned array collects the file names the page asked for, in request order, so a test can
 * assert which font the scene actually loaded. Without that a scene that ignored its query string
 * would still render its default font and pass.
 *
 * @param {Page} page - The page to intercept on.
 * @param {boolean} serveFonts - False to 404 everything but the texture, which leaves the scene with no text to lay out.
 * @returns {Promise<string[]>} The names requested so far, appended to as the page loads.
 */
export async function routeFonts(page: Page, serveFonts: boolean): Promise<string[]> {
  const requested: string[] = [];
  await page.route(`${RAW}**`, (route) => {
    const name = route.request().url().slice(RAW.length);
    requested.push(name);
    const file = path.join(FONTS, name);
    if (!serveFonts && !name.endsWith('.png')) return route.fulfill({ status: 404, body: 'not served' });
    if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: `missing ${name}` });
    return route.fulfill({ status: 200, headers: { 'content-type': CONTENT_TYPES[path.extname(name)] ?? 'text/plain' }, body: fs.readFileSync(file) });
  });
  return requested;
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
export async function inkPercent(page: Page): Promise<number> {
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
 * @param {string} route - The demo route, query string included.
 * @param {boolean} serveFonts - Whether the fonts should be served.
 * @returns {Promise<string[]>} The font file names the page requested.
 */
export async function openScene(page: Page, route: string, serveFonts: boolean): Promise<string[]> {
  const requested = await routeFonts(page, serveFonts);
  await page.goto(route);
  await page.waitForSelector('canvas');
  // An element screenshot captures what is composited over the canvas, and two overlays sit there:
  // stats.js mounts a `position: fixed` panel and the demo's own nav is a MUI Paper. Both are white,
  // and together they were 3.44% of the frame — most of what the floor used to measure. Hiding them
  // leaves the floor at the axes helper alone, which is a stable 0.89% on every route.
  await page.addStyleTag({ content: 'body * { visibility: hidden !important; } canvas { visibility: visible !important; }' });
  await expect.poll(() => inkPercent(page), { timeout: WAIT }).toBeGreaterThan(0.5);
  return requested;
}
