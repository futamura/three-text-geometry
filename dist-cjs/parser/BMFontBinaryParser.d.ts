import { BMFont, IBMFontParser } from '../types';
declare class BMFontBinaryParser implements IBMFontParser<Uint8Array | ArrayBuffer> {
    private static HEADER;
    parse(data: Uint8Array | ArrayBuffer): BMFont;
    private readBlock;
    private readInfo;
    private readCommon;
    private readPages;
    private readChars;
    private readKernings;
    private readStringNT;
    private readNameLengthNT;
    private decodeUtf8;
}
export { BMFontBinaryParser };
//# sourceMappingURL=BMFontBinaryParser.d.ts.map