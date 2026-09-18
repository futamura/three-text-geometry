import { expect, test } from '@playwright/test';

import { inkPercent, openScene, WAIT } from './helpers';

/**
 * Every route the demo serves. `/shader` and `/shuffleshader` build their material with `wgslFn`, so
 * it is raw WGSL and only compiles on the WebGPU backend — see the flags in playwright.config.ts.
 */
const ROUTES = ['/simple', '/shuffle', '/shader', '/shuffleshader', '/multipage'];

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
    await expect.poll(() => inkPercent(page), { timeout: WAIT }).toBeGreaterThan(floor * 2);
    expect(errors).toEqual([]);
  });
}
