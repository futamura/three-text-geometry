import * as fs from 'fs';
import { TextLayout } from '@three-text-geometry/layout';
import { BMFontAsciiParser, BMFontJsonParser } from '@three-text-geometry/parser';
import { BMFont, BMFontChar, DefaultBMFont, TextAlign, TextGlyph, TextLayoutOption, WordWrapMode } from '@three-text-geometry/types';

function DefaultBMFontChar(): BMFontChar {
  return {
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
}

describe('TextLayout', () => {
  describe('Option', () => {
    test('No font option', () => {
      try {
        new TextLayout('');
      } catch (e) {
        expect(e).toEqual(new TypeError('Must specify a `font` in options'));
      }
    });

    test('Multiple option values', () => {
      const json = fs.readFileSync('tests/fonts/Lato-Regular-32.json').toString();
      const font = new BMFontJsonParser().parse(json);
      const option = {
        font: font,
        start: 1,
        end: 10,
        width: 3,
        align: TextAlign.Left,
        mode: WordWrapMode.Pre,
        letterSpacing: 1,
        lineHeight: font.common.lineHeight,
        tabSize: 1,
      };
      const layout = new TextLayout('Multiple option values', option);
      expect(layout.option.font).toStrictEqual(option.font);
      expect(layout.option.start).toStrictEqual(option.start);
      expect(layout.option.end).toStrictEqual(option.end);
      expect(layout.option.width).toStrictEqual(option.width);
      expect(layout.option.align).toStrictEqual(option.align);
      expect(layout.option.mode).toStrictEqual(option.mode);
      expect(layout.option.letterSpacing).toStrictEqual(option.letterSpacing);
      expect(layout.option.lineHeight).toStrictEqual(option.lineHeight);
      expect(layout.option.tabSize).toStrictEqual(option.tabSize);
    });
  });

  describe('Dimension', () => {
    /** Load Font */
    // const ascii: string = fs.readFileSync('tests/fonts/Lato-Regular-32.fnt').toString();
    // const font = new BMFontAsciiParser().parse(ascii);
    const json = fs.readFileSync('tests/fonts/Lato-Regular-32.json').toString();
    const font = new BMFontJsonParser().parse(json);
    let _xIndex: number | undefined;
    let xGlyph: BMFontChar = DefaultBMFontChar();
    font.chars.forEach((val: BMFontChar) => {
      if (val.id === 'x'.charCodeAt(0)) {
        _xIndex = val.id;
        xGlyph = val;
        return;
      }
    });
    const xHeight = 20;
    const baseline = 32;
    const lineHeight = 38;
    const descender = lineHeight - baseline;
    xGlyph.height = xHeight;
    xGlyph.width = 17;
    xGlyph.xoffset = 2;
    font.common.lineHeight = lineHeight;
    font.common.base = baseline;

    /** Load Font */
    const layout0 = new TextLayout('x', { font: font });

    test('line height matches', () => {
      expect(layout0.height).toBe(lineHeight - descender);
    });

    test('width matches', () => {
      expect(layout0.width).toBe(xGlyph.width + xGlyph.xoffset);
    });

    test('descender matches', () => {
      expect(layout0.descender).toBe(lineHeight - baseline);
    });

    test('ascender matches', () => {
      expect(layout0.ascender).toBe(lineHeight - descender - xHeight);
    });

    test('x-height matches', () => {
      expect(layout0.xHeight).toBe(xHeight);
    });

    test('baseline matches', () => {
      expect(layout0.baseline).toBe(baseline);
    });

    const layout1 = new TextLayout('xx', { font: font });

    test('calculates whole width', () => {
      expect(layout1.width).toBe(xGlyph.xadvance + xGlyph.width + xGlyph.xoffset);
    });

    const layout2 = new TextLayout('xx\nx', { font: font });

    test('multi line width matches', () => {
      expect(layout2.width).toBe(xGlyph.xadvance + xGlyph.width + xGlyph.xoffset);
    });

    const letterSpacing = 4;
    const layout3 = new TextLayout('xx', { font: font, letterSpacing: letterSpacing });

    test('letter spacing matches', () => {
      expect(layout3.width).toBe(xGlyph.xadvance + xGlyph.width + xGlyph.xoffset + letterSpacing);
    });

    const layout4 = new TextLayout('hx\nab', { font: font });

    test('provides glyphs', () => {
      const result = layout4.glyphs.map((x: TextGlyph) => String.fromCharCode(x.data.id)).join('');
      expect(result).toStrictEqual('hxab');
    });

    test('provides lines', () => {
      const result = layout4.glyphs.map((x: TextGlyph) => x.line);
      expect(result).toStrictEqual([0, 0, 1, 1]);
    });

    test('provides indices', () => {
      const result = layout4.glyphs.map((x: TextGlyph) => x.index);
      expect(result).toStrictEqual([0, 1, 3, 4]);
    });
  });

  describe('Update text multiple times', () => {
    const str = fs.readFileSync('tests/fonts/Lato-Regular-64.fnt').toString();
    const font = new BMFontAsciiParser().parse(str);
    const text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nNulla enim odio, tincidunt sed fringilla sed, placerat vel lectus.`;
    const option: TextLayoutOption = {
      font: font,
      align: TextAlign.Left,
      width: 1000,
    };
    const layout = new TextLayout(text, option);
    let prevOption = layout.option;
    let prevHeight = layout.height;
    for (let i = 1; i <= 10; i++) {
      layout.update(text);
      const curOption = layout.option;
      const curHeight = layout.height;
      test(`prevOption === curOption`, () => {
        expect(JSON.stringify(prevOption)).toEqual(JSON.stringify(curOption));
      });
      test(`prevHeight === curHeight`, () => {
        expect(prevHeight).toEqual(curHeight);
      });
      prevOption = curOption;
      prevHeight = curHeight;
    }
  });

  describe('Accessors', () => {
    const json = fs.readFileSync('tests/fonts/Lato-Regular-32.json').toString();
    const font = new BMFontJsonParser().parse(json);

    test('text setter re-runs the layout', () => {
      const layout = new TextLayout('xx', { font: font });
      layout.text = 'hh';
      expect(layout.text).toStrictEqual('hh');
      expect(layout.glyphs.map((glyph: TextGlyph) => String.fromCharCode(glyph.data.id)).join('')).toStrictEqual('hh');
    });

    test('text setter re-derives the end index', () => {
      const layout = new TextLayout('xx', { font: font });
      layout.text = 'hhhh';
      expect(layout.text).toStrictEqual('hhhh');
      expect(layout.option.end).toStrictEqual(4);
      expect(layout.glyphs.length).toStrictEqual(4);
    });

    test('update re-derives the end index when it is given no option', () => {
      const layout = new TextLayout('xx', { font: font });
      layout.update('hhhh');
      expect(layout.option.end).toStrictEqual(4);
      expect(layout.glyphs.length).toStrictEqual(4);
    });

    test('update without a text leaves the end index alone', () => {
      const layout = new TextLayout('hhhh', { font: font, end: 2 });
      layout.update();
      expect(layout.option.end).toStrictEqual(2);
      expect(layout.glyphs.length).toStrictEqual(2);
    });

    test('option setter replaces the whole option', () => {
      const layout = new TextLayout('xx', { font: font, letterSpacing: 8, align: TextAlign.Right });
      layout.option = { font: font, letterSpacing: 4 };
      expect(layout.option.letterSpacing).toStrictEqual(4);
      expect(layout.option.align).toStrictEqual(TextAlign.Left);
      expect(layout.glyphs.length).toStrictEqual(2);
    });

    test('cap height and line height match the font', () => {
      const layout = new TextLayout('Hx', { font: font });
      expect(layout.lineHeight).toStrictEqual(font.common.lineHeight);
      expect(layout.capHeight).toBeGreaterThan(0);
    });

    test('toString reports the metrics', () => {
      const layout = new TextLayout('Hx', { font: font });
      expect(layout.toString()).toContain('glyphs: 2');
      expect(layout.toString()).toContain(`lineHeight: ${font.common.lineHeight}`);
      expect(layout.toString()).toContain(`baseline: ${font.common.base}`);
    });
  });

  describe('Fallback glyphs', () => {
    /**
     * Builds a minimal font that provides a glyph for each of the given characters.
     *
     * @param {string} chars - The characters to provide a glyph for.
     * @returns {BMFont} The font.
     */
    function FontOf(chars: string): BMFont {
      const font = DefaultBMFont() as BMFont;
      font.common.lineHeight = 10;
      font.common.base = 8;
      font.common.scaleW = 64;
      font.common.scaleH = 64;
      font.chars = chars.split('').map((char: string, index: number) => ({
        ...DefaultBMFontChar(),
        id: char.charCodeAt(0),
        index: index,
        char: char,
        width: 6,
        height: 8,
        xadvance: 7,
      }));
      return font;
    }

    test('falls back to the m glyph when the font has no space', () => {
      const font = FontOf('am');
      const layout = new TextLayout('a a', { font: font });
      expect(layout.glyphs.map((glyph: TextGlyph) => glyph.data.id)).toStrictEqual(['a', 'm', 'a'].map((char: string) => char.charCodeAt(0)));
    });

    test('falls back to the first glyph when the font has no space, m or w', () => {
      const font = FontOf('H');
      const layout = new TextLayout('H H', { font: font });
      expect(layout.glyphs.map((glyph: TextGlyph) => glyph.data.id)).toStrictEqual(['H', 'H', 'H'].map((char: string) => char.charCodeAt(0)));
    });

    test('skips a character the font has no glyph for', () => {
      const font = FontOf('am');
      const layout = new TextLayout('az', { font: font });
      expect(layout.glyphs.length).toStrictEqual(1);
      expect(layout.glyphs[0]!.data.id).toStrictEqual('a'.charCodeAt(0));
    });

    test('x-height is 0 when the font has no x-height character', () => {
      const layout = new TextLayout('H', { font: FontOf('H') });
      expect(layout.xHeight).toStrictEqual(0);
    });

    test('cap height is 0 when the font has no cap-height character', () => {
      const layout = new TextLayout('a', { font: FontOf('am') });
      expect(layout.capHeight).toStrictEqual(0);
    });

    test('a font without chars lays out nothing', () => {
      const layout = new TextLayout('abc', { font: DefaultBMFont() as BMFont });
      expect(layout.glyphs).toStrictEqual([]);
      expect(layout.width).toStrictEqual(0);
      expect(layout.height).toStrictEqual(0);
    });

    test('an option without a font keeps the one the layout has', () => {
      const font = FontOf('am');
      const layout = new TextLayout('am', { font });

      layout.update('am', { letterSpacing: 4 });

      expect(layout.option.font).toBe(font);
      expect(layout.option.letterSpacing).toStrictEqual(4);
      expect(layout.glyphs.length).toStrictEqual(2);
    });

    test('substitutes the tab fallback glyph', () => {
      const str = fs.readFileSync('tests/fonts/Lato-Regular-64.fnt').toString();
      const font = new BMFontAsciiParser().parse(str);
      const space = font.chars.find((char: BMFontChar) => char.id === ' '.charCodeAt(0))!;
      const layout = new TextLayout('a\tb', { font: font, tabSize: 3 });
      const tab = layout.glyphs[1]!.data;
      expect(layout.glyphs.length).toStrictEqual(3);
      expect(tab.id).toStrictEqual('\t'.charCodeAt(0));
      expect(tab.xadvance).toStrictEqual(3 * space.xadvance);
    });
  });
});
