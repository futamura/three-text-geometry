import { color, dFdx, dFdy, float, Fn, smoothstep, texture, uv, vec2 } from 'three/tsl';
import * as THREE from 'three/webgpu';

import { TextMaterialOption } from './types.js';

/**
 * Anti-aliased step function for SDF rendering.
 * Uses screen-space derivatives to calculate smooth edges.
 */
const aastep = Fn(([value_immutable]: [any]) => {
  const value = float(value_immutable);
  const afwidth = vec2(dFdx(value as any), dFdy(value as any))
    .length()
    .mul(0.70710678118654757);
  return smoothstep((float(0.5) as any).sub(afwidth), (float(0.5) as any).add(afwidth), value as any);
});

/**
 * A node-based material for SDF (Signed Distance Field) text rendering.
 * Uses screen-space derivatives for anti-aliased edges.
 * Works with both WebGL and WebGPU renderers via TSL.
 *
 * @class SDFTextNodeMaterial
 */
class SDFTextNodeMaterial extends THREE.MeshBasicNodeMaterial {
  /**
   * Creates an instance of SDFTextNodeMaterial.
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

    const texAlpha = texture(map, uv()).a;
    const alpha = aastep(texAlpha);

    this.colorNode = color(col);
    this.opacityNode = (alpha as any).mul(float(opacityVal));
    this.alphaTestNode = float(alphaTestVal);
    this.transparent = opt.transparent ?? true;
  }
}

export { SDFTextNodeMaterial };
