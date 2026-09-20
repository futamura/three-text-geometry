import { attribute, color, float, Fn, If, texture, uv, vec4 } from 'three/tsl';
import * as THREE from 'three/webgpu';

import { MultiPageTextMaterialOption } from './types.js';

/**
 * A node-based material for multi-page bitmap text rendering.
 * Selects the correct texture atlas per vertex using a page attribute
 * and an If/ElseIf chain in TSL.
 * Works with both WebGL and WebGPU renderers via TSL.
 *
 * @class MultiPageTextNodeMaterial
 */
class MultiPageTextNodeMaterial extends THREE.MeshBasicNodeMaterial {
  /**
   * Creates an instance of MultiPageTextNodeMaterial.
   *
   * @param {MultiPageTextMaterialOption} [option] - Material configuration options.
   */
  constructor(option?: MultiPageTextMaterialOption) {
    super();
    const opt = option ?? {};
    const opacityVal = opt.opacity ?? 1;
    const alphaTestVal = opt.alphaTest ?? 0.0001;
    const col = opt.color ?? new THREE.Color();
    const textures = opt.textures ?? [];

    if (textures.length === 0) {
      this.colorNode = color(col);
      this.opacityNode = float(opacityVal);
      this.alphaTestNode = float(alphaTestVal);
      this.transparent = opt.transparent ?? true;
      return;
    }

    const page: any = attribute('page', 'float');
    const uvNode = uv();

    const selectPage = Fn(() => {
      const result: any = vec4(0, 0, 0, 0).toVar();
      let chain: any = If(page.equal(float(0)), () => {
        result.assign(texture(textures[0], uvNode));
      });
      for (let i = 1; i < textures.length; i++) {
        chain = chain.ElseIf(page.equal(float(i)), () => {
          result.assign(texture(textures[i], uvNode));
        });
      }
      return result;
    });

    const texSample = selectPage();

    this.colorNode = texSample.rgb.mul(color(col));
    this.opacityNode = texSample.a.mul(float(opacityVal));
    this.alphaTestNode = float(alphaTestVal);
    this.transparent = opt.transparent ?? true;
  }
}

export { MultiPageTextNodeMaterial };
