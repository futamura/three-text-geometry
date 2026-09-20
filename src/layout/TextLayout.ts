import { WordWrap } from '../layout/index.js';
import { BMFont, BMFontChar, TextAlign, TextGlyph, TextLayoutOption, WordMetrics } from '../types/index.js';

/**
 * Class representing the layout of text using a bitmap font.
 *
 * @class
 * @property {TextLayoutOption} option - The options for the text layout.
 * @property {TextGlyph[]} glyphs - The glyphs used in the text layout.
 * @property {number} width - The width of the text layout.
 * @property {number} height - The height of the text layout.
 * @property {number} descender - The descender value of the text layout.
 * @property {number} ascender - The ascender value of the text layout.
 * @property {number} xHeight - The x-height of the text layout.
 * @property {number} baseline - The baseline of the text layout.
 * @property {number} capHeight - The cap height of the text layout.
 * @property {number} lineHeight - The line height of the text layout.
 */
class TextLayout {
  static readonly X_HEIGHTS = ['x', 'e', 'a', 'o', 'n', 's', 'r', 'c', 'u', 'm', 'v', 'w', 'z'];
  static readonly M_WIDTHS = ['m', 'w'];
  static readonly CAP_HEIGHTS = ['H', 'I', 'N', 'E', 'F', 'K', 'L', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  static readonly TAB_ID = '\t'.charCodeAt(0);
  static readonly SPACE_ID = ' '.charCodeAt(0);

  private _text: string = '';

  private _opt: TextLayoutOption = {
    font: undefined,
    letterSpacing: undefined,
    tabSize: undefined,
    lineHeight: undefined,
    align: undefined,
    start: undefined,
    end: undefined,
    width: undefined,
    mode: undefined,
    measure: undefined,
  };

  // private _linesTotal = 0;
  private _fallbackSpaceGlyph: BMFontChar | null = null;
  private _fallbackTabGlyph: BMFontChar | null = null;

  private _glyphs?: TextGlyph[];
  private _width?: number;
  private _height?: number;
  private _descender?: number;
  private _ascender?: number;
  private _xHeight?: number;
  private _baseline?: number;
  private _capHeight?: number;
  private _lineHeight?: number;

  /**
   * Gets the text used in the text layout.
   *
   * @returns {string} The text used in the text layout.
   */
  public get text(): string {
    return this._text;
  }

  /**
   * Sets the text used in the text layout.
   *
   * @param {string} value - The text used in the text layout.
   */
  public set text(value: string) {
    this.update(value);
  }

  /**
   * Gets the options for the text layout.
   *
   * @returns {TextLayoutOption} The options for the text layout.
   */
  public get option(): TextLayoutOption {
    return { ...this._opt } as TextLayoutOption;
  }

  /**
   * Sets the options for the text layout.
   *
   * @param {TextLayoutOption} value - The options for the text layout.
   */
  public set option(value: TextLayoutOption) {
    this._opt = { ...value };
    this.update(this._text, this._opt);
  }

  /**
   * Gets the glyphs used in the text layout.
   *
   * @returns {TextGlyph[]} The array of glyphs.
   * @readonly
   */
  public get glyphs(): TextGlyph[] {
    return this._glyphs ?? [];
  }

  /**
   * Gets the width of the text layout.
   *
   * @returns {number} The width of the text layout.
   * @readonly
   */
  public get width(): number {
    return this._width ?? 0;
  }

  /**
   * Gets the height of the text layout.
   *
   * @returns {number} The height of the text layout.
   * @readonly
   */
  public get height(): number {
    return this._height ?? 0;
  }

  /**
   * Gets the descender value of the text layout.
   *
   * @returns {number} The descender value.
   * @readonly
   */
  public get descender(): number {
    return this._descender ?? 0;
  }

  /**
   * Gets the ascender value of the text layout.
   *
   * @returns {number} The ascender value.
   * @readonly
   */
  public get ascender(): number {
    return this._ascender ?? 0;
  }

  /**
   * Gets the x-height of the text layout.
   *
   * @returns {number} The x-height value.
   * @readonly
   */
  public get xHeight(): number {
    return this._xHeight ?? 0;
  }

  /**
   * Gets the baseline of the text layout.
   *
   * @returns {number} The baseline value.
   * @readonly
   */
  public get baseline(): number {
    return this._baseline ?? 0;
  }

  /**
   * Gets the cap height of the text layout.
   *
   * @returns {number} The cap height value.
   * @readonly
   */
  public get capHeight(): number {
    return this._capHeight ?? 0;
  }

  /**
   * Gets the line height of the text layout.
   *
   * @returns {number} The line height value.
   * @readonly
   */
  public get lineHeight(): number {
    return this._lineHeight ?? 0;
  }

  /**
   * Returns a string representation of the text layout.
   *
   * @returns {string} The string representation.
   */
  public toString() {
    return `{
  glyphs: ${this.glyphs.length}
  width: ${this.width}
  height: ${this.height}
  descender: ${this.descender}
  ascender: ${this.ascender}
  xHeight: ${this.xHeight}
  baseline: ${this.baseline}
  capHeight: ${this.capHeight}
  lineHeight: ${this.lineHeight}
}`;
  }

  /**
   * Creates an instance of TextLayout.
   *
   * @param {string} text - The text to layout.
   * @param {any} option - The options for the text layout.
   * @throws {TypeError} If the font is not specified in options.
   */
  constructor(text: string, option: any = {}) {
    if (option.font === undefined) throw new TypeError('Must specify a `font` in options');
    this._opt.font = option.font;
    this.update(text, option);
  }

  /**
   * Updates the text layout with new text and options.
   *
   * `end` is derived from the text, so a call that changes the text re-derives it, whether or not
   * it passes an option.
   *
   * @param {string} text - The text to layout.
   * @param {any} option - The options for the text layout.
   */
  public update(text?: string, option?: any) {
    this._text = text ?? this._text;
    /** Initialize variables */
    this._glyphs = [];
    this._width = 0;
    this._height = 0;
    this._descender = 0;
    this._ascender = 0;
    this._xHeight = 0;
    this._baseline = 0;
    this._capHeight = 0;
    this._lineHeight = 0;
    /** Initialize options */
    if (option) {
      if (option.font !== undefined) this._opt.font = option.font;
      if (option.start !== undefined) this._opt.start = Math.max(0, option.start);
      else this._opt.start = 0;
      if (option.end !== undefined) this._opt.end = option.end;
      else this._opt.end = this._text.length;
      if (option.width !== undefined) this._opt.width = option.width;
      if (option.align !== undefined) this._opt.align = option.align;
      else this._opt.align = TextAlign.Left;
      if (option.mode !== undefined) this._opt.mode = option.mode;
      if (option.letterSpacing !== undefined) this._opt.letterSpacing = option.letterSpacing;
      else this._opt.letterSpacing = 0;
      if (option.lineHeight !== undefined) this._opt.lineHeight = option.lineHeight;
      else this._opt.lineHeight = this._opt.font!.common.lineHeight;
      if (option.tabSize !== undefined) this._opt.tabSize = option.tabSize;
      else this._opt.tabSize = 4;
      this._opt.measure = this.computeMetrics.bind(this);
      this._setupSpaceGlyphs(this._opt.font!, this._opt.tabSize!);
    } else if (text !== undefined) {
      /** The text changed on its own, so `end` is re-derived the way passing an option would. */
      this._opt.end = this._text.length;
    }

    const font: BMFont = this._opt.font!;

    const lines = new WordWrap().lines(this._text, this._opt);
    const minWidth = this._opt.width || 0;

    /** get max line width */
    const maxLineWidth = lines.reduce((prev: number, line: WordMetrics) => {
      return Math.max(prev, line.width, minWidth);
    }, 0);

    /** the pen position */
    let x = 0;
    let y = 0;
    const lineHeight: number = this._opt.lineHeight!;
    const baseline: number = font.common.base;
    const descender: number = lineHeight - baseline;
    const letterSpacing: number = this._opt.letterSpacing!;
    const height: number = lineHeight * lines.length - descender;
    const align: TextAlign = this._opt.align!;

    /** draw text along baseline */
    // y -= height

    /** the metrics for this text layout */
    this._width = maxLineWidth;
    this._height = height;
    this._descender = lineHeight - baseline;
    this._baseline = baseline;
    this._xHeight = this.getXHeight(font);
    this._capHeight = this.getCapHeight(font);
    this._lineHeight = lineHeight;
    this._ascender = lineHeight - descender - this._xHeight;

    /** layout each glyph */
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line: WordMetrics = lines[lineIndex]!;
      const start = line.start;
      const end = line.end;
      const lineWidth = line.width;
      let lastGlyph = undefined;
      /** for each glyph in that line... */
      for (let i = start; i < end; i++) {
        const id = this._text.charCodeAt(i);
        const glyph = this.getGlyph(font, id);
        if (glyph) {
          if (lastGlyph) x += this.getKerning(font, lastGlyph.id, glyph.id);

          let tx = x;
          if (align === TextAlign.Center) tx += (maxLineWidth - lineWidth) / 2;
          else if (align === TextAlign.Right) tx += maxLineWidth - lineWidth;

          this._glyphs.push({
            position: [tx, y],
            data: glyph,
            index: i,
            line: lineIndex,
          });

          /** move pen forward */
          x += glyph.xadvance + letterSpacing;
          lastGlyph = glyph;
        }
      }

      /** next line DOWN */
      y += lineHeight;
      x = 0;
    }
  }

  /**
   * Sets up fallback glyphs for space and tab characters.
   *
   * @param {BMFont} font - The bitmap font to use.
   * @param {number} tabSize - The size of the tab character.
   */
  private _setupSpaceGlyphs(font: BMFont, tabSize: number) {
    /** These are fallbacks, when the font doesn't include */
    /** ' ' or '\t' glyphs */
    this._fallbackSpaceGlyph = null;
    this._fallbackTabGlyph = null;

    if (!font.chars || font.chars.length === 0) return;

    /** try to get space glyph */
    /** then fall back to the 'm' or 'w' glyphs */
    /** then fall back to the first glyph available */
    const space = this.getGlyphById(font, TextLayout.SPACE_ID) || this.getMGlyph(font) || font.chars[0];
    if (!space) return;
    /** and create a fallback for tab */
    const tabWidth: number = tabSize * space.xadvance;
    this._fallbackSpaceGlyph = { ...space };
    this._fallbackTabGlyph = Object.assign(
      { ...space },
      {
        x: 0,
        y: 0,
        xadvance: tabWidth,
        id: TextLayout.TAB_ID,
        xoffset: 0,
        yoffset: 0,
        width: 0,
        height: 0,
      },
    );
  }

  /**
   * Gets the glyph for a specific character ID.
   *
   * @param {BMFont} font - The bitmap font to use.
   * @param {number} id - The character ID.
   * @returns {BMFontChar | null} The glyph for the character, or null if not found.
   */
  private getGlyph(font: BMFont, id: number): BMFontChar | null {
    const glyph = this.getGlyphById(font, id);
    if (glyph) return glyph;
    else if (id === TextLayout.TAB_ID) return this._fallbackTabGlyph;
    else if (id === TextLayout.SPACE_ID) return this._fallbackSpaceGlyph;
    return null;
  }

  /**
   * Computes the metrics for a given text segment.
   *
   * @param {string} text - The text to measure.
   * @param {number} start - The starting index of the text segment.
   * @param {number} end - The ending index of the text segment.
   * @param {number} width - The maximum width for the text segment.
   * @returns {WordMetrics} The computed metrics for the text segment.
   */
  private computeMetrics(text: string, start: number, end: number, width: number): WordMetrics {
    const letterSpacing = this._opt.letterSpacing || 0;
    const font = this._opt.font;
    let curPen = 0;
    let curWidth = 0;
    let count = 0;

    if (!font || !font.chars || font.chars.length === 0) {
      return {
        start: start,
        end: start,
        width: 0,
      };
    }

    end = Math.min(text.length, end);
    let lastGlyph: BMFontChar | undefined;
    for (let i = start; i < end; i++) {
      const id = text.charCodeAt(i);
      const glyph: BMFontChar | null = this.getGlyph(font, id);

      if (glyph) {
        /** move pen forward */
        // const xoff = glyph.xoffset;
        const kern = lastGlyph ? this.getKerning(font, lastGlyph.id, glyph.id) : 0;
        curPen += kern;

        const nextPen = curPen + glyph.xadvance + letterSpacing;
        const nextWidth = curPen + glyph.width;

        /** we've hit our limit; we can't move onto the next glyph */
        if (nextWidth >= width || nextPen >= width) break;

        /** otherwise continue along our line */
        curPen = nextPen;
        curWidth = nextWidth;
        lastGlyph = glyph;
      }
      count++;
    }

    /** make sure rightmost edge lines up with rendered glyphs */
    if (lastGlyph) curWidth += lastGlyph.xoffset;
    return {
      start: start,
      end: start + count,
      width: curWidth,
    };
  }

  /**
   * Gets a glyph by its character ID.
   *
   * @param {BMFont} font - The bitmap font to use.
   * @param {number} id - The character ID.
   * @returns {BMFontChar | undefined} The glyph if found, otherwise undefined.
   */
  private getGlyphById(font: BMFont, id: number): BMFontChar | undefined {
    if (!font.chars || font.chars.length === 0) return undefined;
    const glyphIdx = this.findChar(font.chars, id);
    if (glyphIdx >= 0) return font.chars[glyphIdx];
    return undefined;
  }

  /**
   * Gets the x-height of the font.
   *
   * @param {BMFont} font - The bitmap font to use.
   * @returns {number} The x-height value.
   */
  private getXHeight(font: BMFont): number {
    for (let i = 0; i < TextLayout.X_HEIGHTS.length; i++) {
      const id = TextLayout.X_HEIGHTS[i]!.charCodeAt(0);
      const idx = this.findChar(font.chars, id);
      if (idx >= 0) return font.chars[idx]!.height;
    }
    return 0;
  }

  /**
   * Gets the 'm' glyph from the font.
   *
   * @param {BMFont} font - The bitmap font to use.
   * @returns {BMFontChar | undefined} The 'm' glyph if found, otherwise undefined.
   */
  private getMGlyph(font: BMFont): BMFontChar | undefined {
    for (let i = 0; i < TextLayout.M_WIDTHS.length; i++) {
      const id = TextLayout.M_WIDTHS[i]!.charCodeAt(0);
      const idx = this.findChar(font.chars, id);
      if (idx >= 0) return font.chars[idx];
    }
    return undefined;
  }

  /**
   * Gets the cap height of the font.
   *
   * @param {BMFont} font - The bitmap font to use.
   * @returns {number} The cap height value.
   */
  private getCapHeight(font: BMFont): number {
    for (let i = 0; i < TextLayout.CAP_HEIGHTS.length; i++) {
      const id = TextLayout.CAP_HEIGHTS[i]!.charCodeAt(0);
      const idx = this.findChar(font.chars, id);
      if (idx >= 0) return font.chars[idx]!.height;
    }
    return 0;
  }

  /**
   * Gets the kerning value between two glyphs.
   *
   * @param {BMFont} font - The bitmap font to use.
   * @param {number} left - The ID of the left glyph.
   * @param {number} right - The ID of the right glyph.
   * @returns {number} The kerning value.
   */
  private getKerning(font: BMFont, left: number, right: number): number {
    if (!font.kernings || font.kernings.length === 0) return 0;
    const table = font.kernings;
    for (let i = 0; i < table.length; i++) {
      const kern = table[i]!;
      if (kern.first === left && kern.second === right) return kern.amount;
    }
    return 0;
  }

  /**
   * Finds the index of a character in an array of glyphs.
   *
   * @param {BMFontChar[]} array - The array of glyphs.
   * @param {number} value - The character ID to find.
   * @returns {number} The index of the character, or -1 if not found.
   */
  private findChar(array: BMFontChar[], value: number): number {
    for (let i = 0; i < array.length; i++) {
      if (array[i]!.id === value) return i;
    }
    return -1;
  }
}

export { TextLayout };
