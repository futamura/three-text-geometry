/**
 * The root entry point, published as the `three-text-geometry` package.
 *
 * The TSL node materials are deliberately absent: they import `three/webgpu` and `three/tsl`, and
 * live on the `three-text-geometry/tsl` subpath so that this entry does not pull the WebGPU
 * renderer into a bundle that only needs the geometry, the parsers or the R3F helper.
 *
 * @module three-text-geometry
 */

import TextGeometry from './TextGeometry.js';

export * from './helpers/fiber.js';
export * from './helpers/hook.js';
export { BMFontError } from './error/index.js';
export { BMFontAsciiParser, BMFontBinaryParser, BMFontJsonParser, BMFontXMLParser } from './parser/index.js';
export { BMFont, BMFontChar, BMFontCommon, BMFontDistanceField, BMFontInfo, BMFontKern, TextAlign, TextGeometryOption, TextGlyph, WordWrapMode } from './types/index.js';

export default TextGeometry;
