import { clamp, color, float, Fn, fwidth, max, min, texture, uv } from 'three/tsl';
import * as THREE from 'three/webgpu';

import { MSDFTextMaterialOption } from './types.js';

/**
 * Computes the median of three values.
 * Used to extract the signed distance from an MSDF texture.
 */
const median = Fn(
  ([
    r,
    g,
    b,
  ]: [
    any,
    any,
    any,
  ]) => {
    return max(min(r, g), min(max(r, g), b));
  },
);

/**
 * A node-based material for MSDF (Multi-channel Signed Distance Field) text rendering.
 * Computes a median from the RGB channels to derive the signed distance,
 * then uses fwidth for anti-aliased alpha thresholding.
 * Works with both WebGL and WebGPU renderers via TSL.
 *
 * @class MSDFTextNodeMaterial
 */
class MSDFTextNodeMaterial extends THREE.MeshBasicNodeMaterial {
  /**
   * Creates an instance of MSDFTextNodeMaterial.
   *
   * @param {MSDFTextMaterialOption} [option] - Material configuration options.
   */
  constructor(option?: MSDFTextMaterialOption) {
    super();
    const opt = option ?? {};
    const opacityVal = opt.opacity ?? 1;
    const alphaTestVal = opt.alphaTest ?? 0.0001;
    const col = opt.color ?? new THREE.Color();
    const map = opt.map ?? new THREE.Texture();
    const negate = opt.negate ?? true;

    const texSample = texture(map, uv());
    const sample = negate ? float(1.0).sub(texSample) : texSample;

    const sigDist = median(sample.x, sample.y, sample.z).sub(0.5);
    const alpha = clamp(sigDist.div(fwidth(sigDist)).add(0.5), 0.0, 1.0);

    this.colorNode = color(col);
    this.opacityNode = alpha.mul(float(opacityVal));
    this.alphaTestNode = float(alphaTestVal);
    this.transparent = opt.transparent ?? true;
  }
}

export { MSDFTextNodeMaterial };
