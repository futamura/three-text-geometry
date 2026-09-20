interface BMFont {
    pages: string[];
    chars: BMFontChar[];
    info: BMFontInfo;
    common: BMFontCommon;
    distanceField: BMFontDistanceField;
    kernings: BMFontKern[];
}
interface BMFontChar {
    id: number;
    index: number;
    char: string;
    width: number;
    height: number;
    xoffset: number;
    yoffset: number;
    xadvance: number;
    chnl: number;
    x: number;
    y: number;
    page: number;
}
interface BMFontInfo {
    face: string;
    size: number;
    bold: number;
    italic: number;
    charset: string[];
    unicode: number;
    stretchH: number;
    smooth: number;
    aa: number;
    padding: number[];
    spacing: number[];
    fixedHeight: number;
    outline: number;
}
interface BMFontCommon {
    lineHeight: number;
    base: number;
    scaleW: number;
    scaleH: number;
    pages: number;
    packed: number;
    alphaChnl: number;
    redChnl: number;
    greenChnl: number;
    blueChnl: number;
}
interface BMFontDistanceField {
    fieldType: string;
    distanceRange: number;
}
interface BMFontKern {
    first: number;
    second: number;
    amount: number;
}
export { BMFont, BMFontChar, BMFontCommon, BMFontDistanceField, BMFontInfo, BMFontKern };
//# sourceMappingURL=BMFont.d.ts.map