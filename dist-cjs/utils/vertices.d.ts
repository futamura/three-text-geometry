import { TextGlyph } from '../types/index.js';
declare function extractPages(glyphs: TextGlyph[]): Float32Array;
declare function extractUVs(glyphs: TextGlyph[], texWidth: number, texHeight: number, flipY: boolean): Float32Array;
declare function extractPositions(glyphs: TextGlyph[]): Float32Array;
export { extractPages, extractPositions, extractUVs };
//# sourceMappingURL=vertices.d.ts.map