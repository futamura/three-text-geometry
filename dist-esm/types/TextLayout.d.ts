import { BMFont, BMFontChar, WordWrapOption } from '../types/index.js';
interface TextGlyph {
    position: [number, number];
    data: BMFontChar;
    index: number;
    line: number;
}
declare enum TextAlign {
    Left = 0,
    Center = 1,
    Right = 2
}
interface TextLayoutOption extends WordWrapOption {
    font?: BMFont;
    letterSpacing?: number;
    tabSize?: number;
    lineHeight?: number;
    align?: TextAlign;
}
export { TextAlign, TextGlyph, TextLayoutOption };
//# sourceMappingURL=TextLayout.d.ts.map