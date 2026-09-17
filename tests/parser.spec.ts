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
});
