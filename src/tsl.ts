/**
 * TSL node materials, published as the `three-text-geometry/tsl` subpath.
 *
 * They import `three/webgpu` and `three/tsl`, so they are kept out of the root entry: an app that only
 * imports `TextGeometry`, the parsers or the R3F helper must not pull the WebGPU renderer into its bundle.
 *
 * @module three-text-geometry/tsl
 */
export { BasicTextNodeMaterial, MSDFTextNodeMaterial, MultiPageTextNodeMaterial, SDFTextNodeMaterial } from './materials/index.js';
export type { MSDFTextMaterialOption, MultiPageTextMaterialOption, TextMaterialOption } from './materials/index.js';
