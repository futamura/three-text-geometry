import { expect, test } from '@playwright/test';

import { inkPercent, openScene, WAIT } from './helpers';

/**
 * One case per BMFont format the library parses.
 *
 * `demo.spec.ts` covers the five scenes as the demo ships them, and those load JSON and ASCII only —
 * so XML and binary were parsed in a real browser by nothing, which is the gap issue #202 fell
 * through. `/simple` takes the font and texture as query parameters (file names under `tests/fonts`,
 * see `SimpleScene`), so the same scene renders all four.
 *
 * `Arial.bin` carries no texture: the only atlas it names is `font-bin_0.tga`, which is not in the
 * repository and which `TextureLoader` could not read anyway. Passing no texture leaves the scene on
 * an untextured material, so the glyph quads paint solid. That still exercises what is unique to the
 * binary path — `fetch` as an `ArrayBuffer`, then `DataView` and `TextDecoder` — and cross-format
 * agreement of the parsed values is pinned in `tests/parser.spec.ts` rather than here.
 */
const CASES = [
  { format: 'json', font: 'Roboto-Regular.json', texture: 'Roboto-Regular.png' },
  { format: 'xml', font: 'Roboto-Regular.xml', texture: 'Roboto-Regular.png' },
  // Not the Lato `.fnt` the scene defaults to: a case whose font is the default one passes even when
  // the query string is ignored, which is exactly what the assertion below exists to catch.
  { format: 'ascii', font: 'UnitedSansRgBd-48.fnt', texture: 'UnitedSansRgBd-48.png' },
  { format: 'binary', font: 'Arial.bin', texture: null },
];

/**
 * Builds the `/simple` URL that selects one font.
 *
 * @param {string} font - The font file name under `tests/fonts`.
 * @param {string | null} texture - The atlas file name, or null to render untextured.
 * @returns {string} The route with its query string.
 */
function routeFor(font: string, texture: string | null): string {
  const query = new URLSearchParams({ font, ...(texture ? { texture } : {}) });
  return `/simple?${query.toString()}`;
}

for (const { format, font, texture } of CASES) {
  test(`${format} fonts render in the browser`, async ({ page, context }) => {
    const route = routeFor(font, texture);

    // Same construction as demo.spec.ts: the floor is whatever the route draws with no font to lay
    // out, measured in this run because `OrbitControls autoRotate` keeps the lit share drifting.
    const floorPage = await context.newPage();
    await openScene(floorPage, route, false);
    const floor = await inkPercent(floorPage);
    await floorPage.close();

    const errors: string[] = [];
    page.on('console', (message) => message.type() === 'error' && errors.push(`console: ${message.text()}`));
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));

    const requested = await openScene(page, route, true);

    // Without this the test is worthless: a scene that ignored the query string would load its
    // default Lato `.fnt`, render it, and clear the ink bar for every one of these four cases.
    expect(requested).toContain(font);
    if (texture) expect(requested).toContain(texture);

    await expect.poll(() => inkPercent(page), { timeout: WAIT }).toBeGreaterThan(floor * 2);
    expect(errors).toEqual([]);
  });
}
