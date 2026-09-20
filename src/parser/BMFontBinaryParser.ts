/**
 *
 * https://github.com/Jam3/parse-bmfont-binary
 *
 */

import { BMFontError } from '../error/index.js';
import { BMFont, BMFontChar, BMFontCommon, BMFontInfo, BMFontKern, DefaultBMFont, DefaultBMFontCommon, DefaultBMFontInfo, DefaultBMFontKern, IBMFontParser } from '../types/index.js';

/**
 * The class for parsing font data in Binary format.
 *
 * @class BMFontBinaryParser
 */
class BMFontBinaryParser implements IBMFontParser<Uint8Array | ArrayBuffer> {
  private static HEADER = [66, 77, 70];
  /**
   * The function that parses font data from binary data.
   *
   * A Node.js `Buffer` is a `Uint8Array`, so it can be passed as is.
   *
   * ```typescript
   * import { BMFontBinaryParser } from 'three-text-geometry'
   *
   * const data: ArrayBuffer = await (await fetch('font.bin')).arrayBuffer()
   * const parser = new BMFontBinaryParser();
   * const font: BMFont = parser.parse(data)
   * ```
   *
   * @param {Uint8Array | ArrayBuffer} data  `Uint8Array` or `ArrayBuffer` that contains font data.
   * @returns {BMFont} Parsed data that conforms to the `BMFont` interface.
   * @memberof BMFontBinaryParser
   */
  public parse(data: Uint8Array | ArrayBuffer): BMFont {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    if (bytes.length < 6) throw new BMFontError('Invalid buffer length');
    const buf = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const header = BMFontBinaryParser.HEADER.every((byte, i) => {
      return buf.getUint8(i) === byte;
    });
    if (!header) throw new BMFontError('Missing BMF byte header');
    let i = 3;
    const vers = buf.getUint8(i++);
    if (vers > 3) throw new BMFontError('Only supports bitmap font binary v3');
    const target: BMFont = DefaultBMFont();
    try {
      for (let b = 0; b < 5; b++) i += this.readBlock(target, buf, i);
    } catch (e: any) {
      throw new BMFontError(e.message);
    }
    return target;
  }

  private readBlock(target: BMFont, buf: DataView, i: number): number {
    if (i > buf.byteLength - 1) return 0;
    const blockID = buf.getUint8(i++);
    const blockSize = buf.getInt32(i, true);
    i += 4;
    switch (blockID) {
      case 1:
        target.info = this.readInfo(buf, i);
        break;
      case 2:
        target.common = this.readCommon(buf, i);
        break;
      case 3:
        target.pages = this.readPages(buf, i, blockSize);
        break;
      case 4:
        target.chars = this.readChars(buf, i, blockSize);
        break;
      case 5:
        target.kernings = this.readKernings(buf, i, blockSize);
        break;
    }
    return 5 + blockSize;
  }

  private readInfo(buf: DataView, i: number): BMFontInfo {
    const info: BMFontInfo = DefaultBMFontInfo();
    info.size = buf.getInt16(i, true);

    const bitField = buf.getUint8(i + 2);
    info.smooth = (bitField >> 7) & 1;
    info.unicode = (bitField >> 6) & 1;
    info.italic = (bitField >> 5) & 1;
    info.bold = (bitField >> 4) & 1;

    /** fixedHeight is only mentioned in binary spec */
    if ((bitField >> 3) & 1) info.fixedHeight = 1;

    // info.charset = buf.getUint8(i + 3) || ''; /** TODO: Array? or String? */
    info.stretchH = buf.getUint16(i + 4, true);
    info.aa = buf.getUint8(i + 6);
    info.padding = [buf.getInt8(i + 7), buf.getInt8(i + 8), buf.getInt8(i + 9), buf.getInt8(i + 10)];
    info.spacing = [buf.getInt8(i + 11), buf.getInt8(i + 12)];
    info.outline = buf.getUint8(i + 13);
    info.face = this.readStringNT(buf, i + 14);
    return info;
  }

  private readCommon(buf: DataView, i: number): BMFontCommon {
    const common: BMFontCommon = DefaultBMFontCommon();
    common.lineHeight = buf.getUint16(i, true);
    common.base = buf.getUint16(i + 2, true);
    common.scaleW = buf.getUint16(i + 4, true);
    common.scaleH = buf.getUint16(i + 6, true);
    common.pages = buf.getUint16(i + 8, true);
    // const bitField = buf.getUint8(i + 10);
    common.packed = 0;
    common.alphaChnl = buf.getUint8(i + 11);
    common.redChnl = buf.getUint8(i + 12);
    common.greenChnl = buf.getUint8(i + 13);
    common.blueChnl = buf.getUint8(i + 14);
    return common;
  }

  private readPages(buf: DataView, i: number, size: number): Array<string> {
    const pages: Array<string> = [];
    const nameLength = this.readNameLengthNT(buf, i);
    const len = nameLength + 1;
    const count = size / len;
    for (let c = 0; c < count; c++) {
      pages[c] = this.decodeUtf8(buf, i, nameLength);
      i += len;
    }
    return pages;
  }

  private readChars(buf: DataView, i: number, blockSize: number): Array<BMFontChar> {
    const chars: Array<BMFontChar> = [];
    const count = blockSize / 20;
    for (let c = 0; c < count; c++) {
      const char: BMFontChar = {
        id: 0,
        index: 0,
        char: '',
        width: 0,
        height: 0,
        xoffset: 0,
        yoffset: 0,
        xadvance: 0,
        chnl: 0,
        x: 0,
        y: 0,
        page: 0,
      };
      const off = c * 20;
      char.id = buf.getUint32(i + 0 + off, true);
      char.x = buf.getUint16(i + 4 + off, true);
      char.y = buf.getUint16(i + 6 + off, true);
      char.width = buf.getUint16(i + 8 + off, true);
      char.height = buf.getUint16(i + 10 + off, true);
      char.xoffset = buf.getInt16(i + 12 + off, true);
      char.yoffset = buf.getInt16(i + 14 + off, true);
      char.xadvance = buf.getInt16(i + 16 + off, true);
      char.page = buf.getUint8(i + 18 + off);
      char.chnl = buf.getUint8(i + 19 + off);
      chars[c] = char;
    }
    return chars;
  }

  private readKernings(buf: DataView, i: number, blockSize: number): Array<BMFontKern> {
    const kernings: Array<BMFontKern> = [];
    const count = blockSize / 10;
    for (let c = 0; c < count; c++) {
      const kern: BMFontKern = DefaultBMFontKern();
      const off = c * 10;
      kern.first = buf.getUint32(i + 0 + off, true);
      kern.second = buf.getUint32(i + 4 + off, true);
      kern.amount = buf.getInt16(i + 8 + off, true);
      kernings[c] = kern;
    }
    return kernings;
  }

  private readStringNT(buf: DataView, offset: number): string {
    return this.decodeUtf8(buf, offset, this.readNameLengthNT(buf, offset));
  }

  // Byte length of the null-terminated string at `offset`, excluding the terminator.
  private readNameLengthNT(buf: DataView, offset: number): number {
    let pos = offset;
    for (; pos < buf.byteLength; pos++) {
      if (buf.getUint8(pos) === 0x00) break;
    }
    return Math.max(pos - offset, 0);
  }

  private decodeUtf8(buf: DataView, offset: number, length: number): string {
    const start = Math.min(buf.byteOffset + offset, buf.byteOffset + buf.byteLength);
    const end = Math.min(start + length, buf.byteOffset + buf.byteLength);
    return new TextDecoder('utf-8').decode(new Uint8Array(buf.buffer, start, end - start));
  }
}

export { BMFontBinaryParser };
