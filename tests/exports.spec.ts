/**
 * @jest-environment jsdom
 */
import './helpers/webgpu-mock';

import * as tsl from '@three-text-geometry/tsl';

const MATERIALS = ['BasicTextNodeMaterial', 'MSDFTextNodeMaterial', 'MultiPageTextNodeMaterial', 'SDFTextNodeMaterial'];

describe('entry points', () => {
  test('root entry does not load three/webgpu or three/tsl', () => {
    jest.isolateModules(() => {
      jest.doMock('three/webgpu', () => {
        throw new Error('root entry loaded three/webgpu');
      });
      jest.doMock('three/tsl', () => {
        throw new Error('root entry loaded three/tsl');
      });
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const root = require('@three-text-geometry/index');
      expect(typeof root.default).toBe('function');
      expect(typeof root.BMFontJsonParser).toBe('function');
      for (const name of MATERIALS) expect(root).not.toHaveProperty(name);
    });
  });

  test('tsl entry exports the node materials', () => {
    for (const name of MATERIALS) expect(typeof (tsl as Record<string, unknown>)[name]).toBe('function');
  });
});
