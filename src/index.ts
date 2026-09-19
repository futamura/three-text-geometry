/**
 * The root entry point, published as the `three-text-geometry` package.
 *
 * The TSL node materials are deliberately absent: they import `three/webgpu` and `three/tsl`, and
 * live on the `three-text-geometry/tsl` subpath so that this entry does not pull the WebGPU
 * renderer into a bundle that only needs the geometry, the parsers or the R3F helper.
 *
 * @module three-text-geometry
 */

import TextGeometry from './TextGeometry';

export * from './helpers/fiber';
export * from './helpers/hook';
export { BMFontError } from './error';
export { BMFontAsciiParser, BMFontBinaryParser, BMFontJsonParser, BMFontXMLParser } from './parser';
export { BMFont, BMFontChar, BMFontCommon, BMFontDistanceField, BMFontInfo, BMFontKern, TextAlign, TextGeometryOption, TextGlyph, WordWrapMode } from './types';

export default TextGeometry;
