import fs from 'fs';
import path from 'path';
import { BMFontError } from '@three-text-geometry/error';
import { BMFontAsciiParser, BMFontBinaryParser, BMFontJsonParser, BMFontXMLParser } from '@three-text-geometry/parser';
import { BMFont, DefaultBMFontCommon, DefaultBMFontDistanceField, DefaultBMFontInfo, isBMFont } from '@three-text-geometry/types';

function readLocalFile(filePath: string): string;
function readLocalFile(filePath: string, binary: true): Buffer;
function readLocalFile(filePath: string, binary?: boolean): string | Buffer {
  const resolved = path.resolve(__dirname, 'fonts', filePath);
  if (binary) {
    return fs.readFileSync(resolved);
  }
  return fs.readFileSync(resolved, 'utf-8');
}

/**
 * Finds a block in a BMFont binary, whose blocks are a one-byte id, a four-byte size and a payload.
 *
 * @param {Uint8Array} bytes - The font file.
 * @param {number} id - The block id: 1 info, 2 common, 3 pages, 4 chars, 5 kernings.
 * @returns {number} The offset the block starts at, or -1 when the file does not carry it.
 */
function binaryBlockStart(bytes: Uint8Array, id: number): number {
  const buf = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let i = 4;
  while (i < buf.byteLength - 1) {
    if (buf.getUint8(i) === id) return i;
    i += 5 + buf.getInt32(i + 1, true);
  }
  return -1;
}

const XML_SPACE = '<char id="32" x="0" y="0" width="1" height="1" xoffset="0" yoffset="0" xadvance="10" page="0" chnl="15"/>';
const XML_A = '<char id="65" x="2" y="2" width="3" height="4" xoffset="0" yoffset="0" xadvance="12" page="0" chnl="15"/>';
const XML_KERNING = '<kerning first="32" second="65" amount="-1"/>';
const XML_INFO = '<info face="A" size="32" bold="0" italic="0" charset="" unicode="1" stretchH="100" smooth="1" aa="1" padding="0,0,0,0" spacing="0,0"/>';
const XML_COMMON = '<common lineHeight="40" base="30" scaleW="256" scaleH="256" pages="1" packed="0" alphaChnl="0" redChnl="0" greenChnl="0" blueChnl="0"/>';
const XML_PAGES = '<pages><page id="0" file="a.png"/></pages>';

/**
 * A BMFont XML document whose optional parts can be left out, which is what the fixtures in
 * `tests/fonts` never do.
 *
 * @param {object} sections - The parts that differ between the cases below.
 * @param {string} [sections.info] - The `<info>` element.
 * @param {string} [sections.common] - The `<common>` element.
 * @param {string} [sections.pages] - The `<pages>` element.
 * @param {string} [sections.chars] - The `<char>` elements, wrapped in `<chars>` unless empty.
 * @param {string} [sections.kernings] - The `<kerning>` elements; a font with no pairs writes no `<kernings>` at all.
 * @param {string} [sections.distanceField] - The `<distanceField>` element, which only SDF and MSDF generators write.
 * @returns {string} The XML document.
 */
function xmlFont({ info = XML_INFO, common = XML_COMMON, pages = XML_PAGES, chars = XML_SPACE + XML_A, kernings = '', distanceField = '' }: { info?: string; common?: string; pages?: string; chars?: string; kernings?: string; distanceField?: string } = {}): string {
  return ['<?xml version="1.0"?>', '<font>', info, common, pages, chars === '' ? '' : `<chars count="1">${chars}</chars>`, kernings === '' ? '' : `<kernings count="1">${kernings}</kernings>`, distanceField, '</font>'].join('\n');
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

  test('XML / A list with a single element is still an array', () => {
    // fast-xml-parser returns an object rather than a one-element array when a list has one member.
    const font = new BMFontXMLParser().parse(xmlFont({ chars: XML_SPACE, kernings: XML_KERNING }));
    expect(font.chars.map((char) => char.id)).toEqual([32]);
    expect(font.kernings).toEqual([{ first: 32, second: 65, amount: -1 }]);
  });

  test('XML / Char metrics are numbers, as they are in the other formats', () => {
    // Attributes are strings until the parser converts them, and the layout matches glyph ids with
    // `===`, so leaving them as strings made an XML font lay out nothing at all.
    const byId = (font: BMFont) => [...font.chars].sort((a, b) => a.id - b.id);
    const xml = new BMFontXMLParser().parse(readLocalFile('Roboto-Regular.xml'));
    const json = new BMFontJsonParser().parse(readLocalFile('Roboto-Regular.json'));

    expect(byId(xml)).toEqual(byId(json));
    expect(xml.kernings).toEqual(json.kernings);
    expect(xml.common).toEqual(json.common);
  });

  test('XML / A font without kerning pairs writes no kernings element', () => {
    expect(new BMFontXMLParser().parse(xmlFont()).kernings).toEqual([]);
  });

  test('XML / A font that is not an SDF atlas writes no distanceField element', () => {
    expect(new BMFontXMLParser().parse(xmlFont()).distanceField).toEqual(DefaultBMFontDistanceField());
  });

  test('XML / Optional numeric attributes fall back to zero', () => {
    const font = new BMFontXMLParser().parse(
      xmlFont({
        info: '<info face="A" charset="" padding="0,0,0,0" spacing="0,0"/>',
        common: '<common lineHeight="40"/>',
      }),
    );
    expect(font.info).toEqual({ ...DefaultBMFontInfo(), face: 'A', padding: [0, 0, 0, 0], spacing: [0, 0] });
    expect(font.common).toEqual({ ...DefaultBMFontCommon(), lineHeight: 40 });
  });

  test('XML / A document with no font element is rejected', () => {
    // `<font></font>` no longer reaches this guard: with trimValues off it parses to a newline
    // rather than an empty string, so it falls through to the one for `pages` a line below.
    expect(() => new BMFontXMLParser().parse('<?xml version="1.0"?><notafont/>')).toThrow(new BMFontError('No font data in BMFont file'));
  });

  test('XML / Optional attributes on chars, kernings and distanceField fall back to zero', () => {
    const font = new BMFontXMLParser().parse(
      xmlFont({
        common: '<common base="30"/>',
        chars: '<char x="1" y="2" width="3" height="4"/>',
        kernings: '<kerning amount="-1"/><kerning first="32" second="65"/>',
        distanceField: '<distanceField fieldType="msdf"/>',
      }),
    );

    expect(font.common.lineHeight).toStrictEqual(0);
    expect(font.chars[0]).toEqual({ id: 0, index: 0, char: '', width: 3, height: 4, xoffset: 0, yoffset: 0, xadvance: 0, chnl: 0, x: 1, y: 2, page: 0 });
    expect(font.kernings).toEqual([
      { first: 0, second: 0, amount: -1 },
      { first: 32, second: 65, amount: 0 },
    ]);
    expect(font.distanceField).toEqual({ fieldType: 'msdf', distanceRange: 0 });
  });

  test.each([
    ['pages', { pages: '' }, 'No font data in BMFont file'],
    ['chars', { chars: '' }, 'No chars data in BMFont file'],
    ['info', { info: '' }, 'No info data in BMFont file'],
    ['common', { common: '' }, 'No common data in BMFont file'],
  ])('XML / A document without %s is rejected', (_section, sections, message) => {
    expect(() => new BMFontXMLParser().parse(xmlFont(sections))).toThrow(new BMFontError(message));
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
    const data = readLocalFile('Roboto-Regular-empty.json');
    expect(() => new BMFontJsonParser().parse(data)).toThrow(BMFontError);
  });

  test('Json / Invalid', () => {
    const data = readLocalFile('Roboto-Regular-invalid.json');
    expect(() => new BMFontJsonParser().parse(data)).toThrow(BMFontError);
  });

  test('Json / Values that are not a font object are rejected', () => {
    for (const data of ['42', 'null', '[]', '"font"']) {
      expect(() => new BMFontJsonParser().parse(data)).toThrow(BMFontError);
    }
  });

  test('Json / Fonts from each generator in tests/fonts are accepted', () => {
    for (const file of ['Roboto-Regular.json', 'Lato-Regular-32.json', 'OdudoMono-Regular-64.json', 'OdudoMono-Regular-64-Multipage.json', 'OdudoMono-Regular-128.json', 'OdudoMono-Regular-128-Multipage.json']) {
      expect(isBMFont(new BMFontJsonParser().parse(readLocalFile(file)))).toEqual(true);
    }
  });

  test('Json / Fields the layout reads are required', () => {
    const font = JSON.parse(readLocalFile('Roboto-Regular.json'));
    for (const key of ['chars', 'common']) {
      const { [key]: _removed, ...rest } = font;
      expect(() => new BMFontJsonParser().parse(rest)).toThrow(new BMFontError(`Invalid json data: data must have required property '${key}'`));
    }
    for (const key of ['lineHeight', 'base', 'scaleW', 'scaleH']) {
      const { [key]: _removed, ...common } = font.common;
      expect(() => new BMFontJsonParser().parse({ ...font, common })).toThrow(BMFontError);
    }
    for (const key of ['id', 'x', 'y', 'width', 'height', 'xoffset', 'yoffset', 'xadvance']) {
      const { [key]: _removed, ...char } = font.chars[0];
      expect(() => new BMFontJsonParser().parse({ ...font, chars: [char, ...font.chars.slice(1)] })).toThrow(BMFontError);
    }
  });

  test('Json / Fields with the wrong type are rejected', () => {
    const font = JSON.parse(readLocalFile('Roboto-Regular.json'));
    expect(() => new BMFontJsonParser().parse({ ...font, common: { ...font.common, lineHeight: '42' } })).toThrow(BMFontError);
    expect(() => new BMFontJsonParser().parse({ ...font, kernings: [{ first: 1, second: 2 }] })).toThrow(BMFontError);
  });

  test('Json / Optional fields are filled with defaults', () => {
    const font = new BMFontJsonParser().parse({ chars: [], common: { lineHeight: 1, base: 2, scaleW: 3, scaleH: 4 } });
    expect(font.pages).toEqual([]);
    expect(font.kernings).toEqual([]);
    expect(font.info).toEqual(DefaultBMFontInfo());
    expect(font.common).toEqual({ ...DefaultBMFontCommon(), lineHeight: 1, base: 2, scaleW: 3, scaleH: 4 });
    expect(font.distanceField).toEqual(DefaultBMFontDistanceField());

    const msdf = new BMFontJsonParser().parse(readLocalFile('Roboto-Regular.json'));
    expect([msdf.info.fixedHeight, msdf.info.outline]).toEqual([0, 0]);
    expect(msdf.distanceField).toEqual({ fieldType: 'msdf', distanceRange: 4 });
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
    // The budget separates complexity classes, it does not measure speed. The forward pass needs
    // tens of milliseconds for this input and a quadratic scanner needs tens of seconds, so the
    // limit sits far above the linear cost. It has to: the same parse takes several hundred
    // milliseconds once the whole suite runs under --coverage and competes for the CPU, and a
    // tighter limit would be measuring machine load instead. The explicit timeout keeps this
    // assertion, rather than Jest's 5s default, as what reports a regression.
    const start = Date.now();
    const font = new BMFontAsciiParser().parse(data);
    expect(Date.now() - start).toBeLessThan(5000);
    expect(font.info.face).toEqual('A');
    expect(font.info.padding).toEqual([0, 0, 0, 0]);
  }, 20000);

  test('Ascii / The same face parses to the same font as the JSON parser', () => {
    // The equivalent XML test caught #202, where the chars kept their attributes as strings.
    const ascii = new BMFontAsciiParser().parse(readLocalFile('Lato-Regular-32.fnt'));
    const json = new BMFontJsonParser().parse(readLocalFile('Lato-Regular-32.json'));

    expect(ascii.chars).toEqual(json.chars);
    expect(ascii.kernings).toEqual(json.kernings);
    expect(ascii.common).toEqual(json.common);
    expect(ascii.pages).toEqual(json.pages);
  });

  test('Ascii / A line without a separator is rejected', () => {
    expect(() => new BMFontAsciiParser().parse('info')).toThrow(new BMFontError('No page data'));
  });

  test.each([
    ['common', 'No common data'],
    ['page', 'No page data'],
    ['char ', 'No char data'],
  ])('Ascii / A font with no %s line is rejected', (prefix, message) => {
    const data = readLocalFile('Lato-Regular-32.fnt')
      .split('\n')
      .filter((line) => !line.startsWith(prefix))
      .join('\n');

    expect(() => new BMFontAsciiParser().parse(data)).toThrow(new RegExp(`^${message}`));
  });

  test('Ascii / An unknown root key is ignored', () => {
    const data = readLocalFile('Lato-Regular-32.fnt');
    const withExtra = data.replace('info face=', 'future key=1\ninfo face=');

    expect(new BMFontAsciiParser().parse(withExtra)).toEqual(new BMFontAsciiParser().parse(data));
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

  test('Binary / A version past 3 is rejected', () => {
    expect(() => new BMFontBinaryParser().parse(new Uint8Array([66, 77, 70, 4, 0, 0]))).toThrow(new BMFontError('Only supports bitmap font binary v3'));
  });

  test('Binary / A font with no kerning pairs writes no kernings block', () => {
    // The block loop reads five blocks, so a file that stops after four has to leave the rest alone.
    const data = new Uint8Array(readLocalFile('Arial.bin', true));
    const font = new BMFontBinaryParser().parse(data.slice(0, binaryBlockStart(data, 5)));

    expect(font.kernings).toEqual([]);
    expect(font.chars).toHaveLength(191);
    expect(font.info.face).toEqual('Arial');
  });

  test('Binary / fixedHeight comes from the info bit field', () => {
    // fixedHeight is only carried by the binary format, and no fixture sets it.
    const data = new Uint8Array(readLocalFile('Arial.bin', true));
    const fixed = data.slice();
    fixed[binaryBlockStart(data, 1) + 5 + 2]! |= 1 << 3;

    expect(new BMFontBinaryParser().parse(data).info.fixedHeight).toEqual(0);
    expect(new BMFontBinaryParser().parse(fixed).info.fixedHeight).toEqual(1);
  });

  test('Binary / charset is not read', () => {
    expect(new BMFontBinaryParser().parse(readLocalFile('Arial.bin', true)).info.charset).toEqual([]);
  });
});
