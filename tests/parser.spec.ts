import fs from 'fs';
import path from 'path';
import { BMFontError } from '@three-text-geometry/error';
import { BMFontAsciiParser, BMFontBinaryParser, BMFontJsonParser, BMFontXMLParser } from '@three-text-geometry/parser';
import { isBMFont } from '@three-text-geometry/types';

function readLocalFile(filePath: string): string;
function readLocalFile(filePath: string, binary: true): Buffer;
function readLocalFile(filePath: string, binary?: boolean): string | Buffer {
  const resolved = path.resolve(__dirname, 'fonts', filePath);
  if (binary) {
    return fs.readFileSync(resolved);
  }
  return fs.readFileSync(resolved, 'utf-8');
}

describe('BMFontParser', () => {
  test('XML / Valid Single Page', () => {
    const data = readLocalFile('Roboto-Regular.xml');
    const font = new BMFontXMLParser().parse(data);
    expect(isBMFont(font)).toEqual(true);
  });

  test('XML / Valid Multiple Page', () => {
    const data = readLocalFile('Roboto-Regular-pages.xml');
    const font = new BMFontXMLParser().parse(data);
    expect(isBMFont(font)).toEqual(true);
  });

  test('XML / Channel attributes are read', () => {
    const data = readLocalFile('Roboto-Regular.xml').replace('alphaChnl="0" redChnl="0" greenChnl="0" blueChnl="0"', 'alphaChnl="1" redChnl="2" greenChnl="3" blueChnl="4"');
    const font = new BMFontXMLParser().parse(data);
    expect([font.common.alphaChnl, font.common.redChnl, font.common.greenChnl, font.common.blueChnl]).toEqual([1, 2, 3, 4]);
  });

  test('XML / charset is split into an array', () => {
    const data = readLocalFile('Roboto-Regular.xml');
    expect(new BMFontXMLParser().parse(data).info.charset).toEqual([]);
    expect(new BMFontXMLParser().parse(data.replace('charset=""', 'charset="ANSI"')).info.charset).toEqual(['ANSI']);
  });

  test('XML / Invalid Single Page', () => {
    try {
      const data = readLocalFile('Roboto-Regular-invalid.xml');
      new BMFontXMLParser().parse(data);
    } catch (error: any) {
      expect(error instanceof BMFontError).toBe(true);
    }
  });

  test('XML / Empty Single Page', () => {
    try {
      const data = readLocalFile('Roboto-Regular-empty.xml');
      new BMFontXMLParser().parse(data);
    } catch (error: any) {
      expect(error instanceof BMFontError).toBe(true);
    }
  });

  test('Json / Valid', () => {
    const data = readLocalFile('Roboto-Regular.json');
    const font = new BMFontJsonParser().parse(data);
    expect(isBMFont(font)).toEqual(true);
  });

  test('Json / charset is passed through as a string or an array', () => {
    const charset = new BMFontJsonParser().parse(readLocalFile('Roboto-Regular.json')).info.charset;
    expect(charset).toHaveLength(95);
    expect(charset.slice(0, 3)).toEqual([' ', '!', '"']);
    expect(new BMFontJsonParser().parse(readLocalFile('Lato-Regular-32.json')).info.charset).toEqual('');
  });

  test('Json / Empty', () => {
    try {
      const data = readLocalFile('Roboto-Regular-empty.json');
      new BMFontJsonParser().parse(data);
    } catch (error: any) {
      expect(error instanceof BMFontError).toBe(true);
    }
  });

  test('Json / Invalid', () => {
    try {
      const data = readLocalFile('Roboto-Regular-invalid.json');
      new BMFontJsonParser().parse(data);
    } catch (error: any) {
      expect(error instanceof BMFontError).toBe(true);
    }
  });

  test('Ascii / Valid / DejaVu-sdf.fnt', () => {
    const data = readLocalFile('DejaVu-sdf.fnt');
    const font = new BMFontAsciiParser().parse(data);
    expect(isBMFont(font)).toEqual(true);
  });

  test('Ascii / Invalid / DejaVu-sdf.fnt', () => {
    try {
      const data = readLocalFile('DejaVu-sdf-invalid.fnt');
      new BMFontAsciiParser().parse(data);
    } catch (error: any) {
      expect(error instanceof BMFontError).toBe(true);
    }
  });

  test('Ascii / Empty / DejaVu-sdf.fnt', () => {
    try {
      const data = readLocalFile('DejaVu-sdf-empty.fnt');
      new BMFontAsciiParser().parse(data);
    } catch (error: any) {
      expect(error instanceof BMFontError).toBe(true);
    }
  });

  test('Ascii / Valid / Lato-Regular-16.fnt', () => {
    const data = readLocalFile('Lato-Regular-16.fnt');
    const font = new BMFontAsciiParser().parse(data);
    expect(isBMFont(font)).toEqual(true);
  });

  test('Ascii / Valid / Lato-Regular-24.fnt', () => {
    const data = readLocalFile('Lato-Regular-24.fnt');
    const font = new BMFontAsciiParser().parse(data);
    expect(isBMFont(font)).toEqual(true);
  });

  test('Ascii / Valid / Lato-Regular-32.fnt', () => {
    const data = readLocalFile('Lato-Regular-32.fnt');
    const font = new BMFontAsciiParser().parse(data);
    expect(isBMFont(font)).toEqual(true);
  });

  test('Ascii / Valid / Lato-Regular-64.fnt', () => {
    const data = readLocalFile('Lato-Regular-64.fnt');
    const font = new BMFontAsciiParser().parse(data);
    expect(isBMFont(font)).toEqual(true);
  });

  test('Ascii / Valid / Norwester-Multi-32.fnt', () => {
    const data = readLocalFile('Norwester-Multi-32.fnt');
    const font = new BMFontAsciiParser().parse(data);
    expect(isBMFont(font)).toEqual(true);
  });

  test('Ascii / Valid / Norwester-Multi-64.fnt', () => {
    const data = readLocalFile('Norwester-Multi-64.fnt');
    const font = new BMFontAsciiParser().parse(data);
    expect(isBMFont(font)).toEqual(true);
  });

  test('Ascii / Quoted values containing spaces are not split', () => {
    const font = new BMFontAsciiParser().parse(readLocalFile('UnitedSansRgBd-24.fnt'));
    expect(font.info.face).toEqual('United Sans Rg Bd');
    expect(Object.keys(font.info)).toEqual(['face', 'size', 'bold', 'italic', 'charset', 'unicode', 'stretchH', 'smooth', 'aa', 'padding', 'spacing', 'outline']);
    expect(font.info.size).toEqual(24);
    expect(font.info.padding).toEqual([0, 0, 0, 0]);
    expect(font.info.spacing).toEqual([1, 1]);
    expect(font.pages).toEqual(['UnitedSansRgBd-24_0.png']);
  });

  test('Ascii / Quoted values keep spaces, tabs and equals signs', () => {
    const data = [
      'info face="A  B\tC" size=12 bold=0 italic=0 charset="" unicode=1 stretchH=100 smooth=1 aa=1 padding=1,2,3,4 spacing=-8,-8',
      'common lineHeight=16 base=12 scaleW=256 scaleH=256 pages=2 packed=0',
      'distanceField fieldType=msdf distanceRange=4',
      "page id=0 file='my font_0.png'",
      'page id=1   file="a=b.png"',
      'char id=32 x=0 y=0 width=1 height=1 xoffset=-1 yoffset=0 xadvance=4 page=0 chnl=15',
      'kerning first=32 second=65 amount=-1',
    ].join('\n');
    const font = new BMFontAsciiParser().parse(data);
    expect(font.info.face).toEqual('A  B\tC');
    expect(font.info.padding).toEqual([1, 2, 3, 4]);
    expect(font.info.spacing).toEqual([-8, -8]);
    expect(font.distanceField).toEqual({ fieldType: 'msdf', distanceRange: 4 });
    expect(font.pages).toEqual(['my font_0.png', 'a=b.png']);
    expect(font.chars[0]).toEqual({ id: 32, x: 0, y: 0, width: 1, height: 1, xoffset: -1, yoffset: 0, xadvance: 4, page: 0, chnl: 15 });
    expect(font.kernings[0]).toEqual({ first: 32, second: 65, amount: -1 });
  });

  test('Ascii / Long lines without separators parse in linear time', () => {
    const data = [
      `info face="A" size=12 ${'a'.repeat(50000)} padding=0,0,0,0 spacing=0,0 junk="${'b '.repeat(25000)}`,
      'common lineHeight=16 base=12 scaleW=256 scaleH=256 pages=1 packed=0',
      'page id=0 file="a.png"',
      'char id=32 x=0 y=0 width=1 height=1 xoffset=0 yoffset=0 xadvance=4 page=0 chnl=15',
    ].join('\n');
    const start = Date.now();
    const font = new BMFontAsciiParser().parse(data);
    expect(Date.now() - start).toBeLessThan(1000);
    expect(font.info.face).toEqual('A');
    expect(font.info.padding).toEqual([0, 0, 0, 0]);
  });

  test('Ascii / Negative numeric lists are parsed as arrays', () => {
    const font = new BMFontAsciiParser().parse(readLocalFile('DejaVu-sdf.fnt'));
    expect(font.info.face).toEqual('DejaVu Sans Mono');
    expect(font.info.padding).toEqual([4, 4, 4, 4]);
    expect(font.info.spacing).toEqual([-8, -8]);
  });

  test('Ascii / charset is kept as a string', () => {
    const data = readLocalFile('Lato-Regular-32.fnt');
    expect(new BMFontAsciiParser().parse(data).info.charset).toEqual('');
    expect(new BMFontAsciiParser().parse(data.replace('charset=""', 'charset="ANSI"')).info.charset).toEqual('ANSI');
  });

  test('Binary / Valid', () => {
    const data = readLocalFile('Arial.bin', true);
    const font = new BMFontBinaryParser().parse(data);
    expect(isBMFont(font)).toEqual(true);
  });

  test('Binary / Valid / Uint8Array and ArrayBuffer match Buffer', () => {
    const data = readLocalFile('Arial.bin', true);
    const expected = new BMFontBinaryParser().parse(data);
    expect(expected.info.face).toEqual('Arial');
    expect(expected.pages).toEqual(['font-bin_0.tga']);
    expect(expected.chars).toHaveLength(191);
    expect(expected.kernings).toHaveLength(91);

    /** A view into a larger buffer, as a pooled `Buffer` or a sliced download would be. */
    const padded = new Uint8Array(data.byteLength + 16);
    padded.set(data, 8);
    expect(new BMFontBinaryParser().parse(padded.subarray(8, 8 + data.byteLength))).toEqual(expected);
    expect(new BMFontBinaryParser().parse(Uint8Array.from(data).buffer)).toEqual(expected);
  });

  test('Binary / Invalid', () => {
    const data = readLocalFile('Arial-invalid.bin', true);
    expect(() => new BMFontBinaryParser().parse(data)).toThrow(BMFontError);
  });

  test('Binary / Empty', () => {
    const data = readLocalFile('Arial-empty.bin', true);
    expect(() => new BMFontBinaryParser().parse(data)).toThrow(new BMFontError('Invalid buffer length'));
  });

  test('Binary / Missing header', () => {
    expect(() => new BMFontBinaryParser().parse(new Uint8Array([0, 0, 0, 3, 0, 0]))).toThrow(new BMFontError('Missing BMF byte header'));
  });

  test('Binary / charset is not read', () => {
    expect(new BMFontBinaryParser().parse(readLocalFile('Arial.bin', true)).info.charset).toEqual([]);
  });
});
