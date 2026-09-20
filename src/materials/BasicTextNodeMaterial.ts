import { color, float, texture, uv } from 'three/tsl';
import * as THREE from 'three/webgpu';

import { TextMaterialOption } from './types.js';

/**
 * A node-based material for basic bitmap text rendering.
 * Samples a font texture and multiplies by color and opacity.
 * Works with both WebGL and WebGPU renderers via TSL.
 *
 * @class BasicTextNodeMaterial
 */
class BasicTextNodeMaterial extends THREE.MeshBasicNodeMaterial {
  /**
   * Creates an instance of BasicTextNodeMaterial.
   *
   * @param {TextMaterialOption} [option] - Material configuration options.
   */
  constructor(option?: TextMaterialOption) {
    super();
    const opt = option ?? {};
    const opacityVal = opt.opacity ?? 1;
    const alphaTestVal = opt.alphaTest ?? 0.0001;
    const col = opt.color ?? new THREE.Color();
    const map = opt.map ?? new THREE.Texture();

    const texSample = texture(map, uv());
    this.colorNode = texSample.rgb.mul(color(col));
    this.opacityNode = texSample.a.mul(float(opacityVal));
    this.alphaTestNode = float(alphaTestVal);
    this.transparent = opt.transparent ?? true;
  }
}

export { BasicTextNodeMaterial };
