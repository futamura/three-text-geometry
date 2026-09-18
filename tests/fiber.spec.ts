/**
 * @jest-environment jsdom
 */
import * as fs from 'fs';
import { createElement } from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { BMFontAsciiParser } from '@three-text-geometry/parser';
import TextGeometry from '@three-text-geometry/TextGeometry';
import { BMFont } from '@three-text-geometry/types';

// R3F checks this before running updates inside act().
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const TEXT = 'Hello';

/**
 * A `<mesh>` holding a `<textGeometry>` built from the given font.
 *
 * @param {BMFont} font - The font the geometry lays out.
 * @returns {ReactElement} The element tree to render.
 */
function tree(font: BMFont) {
  return createElement('mesh', null, createElement('textGeometry', { args: [TEXT, { font }] }));
}

describe('R3F registration', () => {
  let font: BMFont;

  beforeAll(() => {
    font = new BMFontAsciiParser().parse(fs.readFileSync('tests/fonts/Lato-Regular-64.fnt').toString());
  });

  // The catalog is module state in @react-three/fiber, so this has to run before the import below.
  test('textGeometry is unknown until the fiber helper is imported', async () => {
    await expect(ReactThreeTestRenderer.create(tree(font))).rejects.toThrow('TextGeometry is not part of the THREE namespace');
  });

  test('importing the fiber helper registers textGeometry', async () => {
    await import('@three-text-geometry/helpers/fiber');

    const renderer = await ReactThreeTestRenderer.create(tree(font));

    const mesh = renderer.scene.children[0]!.instance as unknown as { geometry: TextGeometry };
    expect(mesh.geometry).toBeInstanceOf(TextGeometry);
    expect(mesh.geometry.text).toEqual(TEXT);
    expect(mesh.geometry.getAttribute('position').count).toBeGreaterThan(0);

    await renderer.unmount();
  });
});
