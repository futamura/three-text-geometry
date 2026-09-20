import { BMFont, BMFontChar, WordWrapOption } from '../types/index.js';

/**
 * The interface to define text glyph.
 *
 * @interface TextGlyph
 */
interface TextGlyph {
  /**
   * The start and end position of the glyph.
   *
   * @type {[number, number]}
   * @memberof TextGlyph
   */
  position: [number, number];
  /**
   * BMFontChar data held by glyphs.
   *
   * @type {BMFontChar}
   * @memberof TextGlyph
   */
  data: BMFontChar;
  /**
   * The index of glyphs.
   *
   * @type {number}
   * @memberof TextGlyph
   */
  index: number;
  /**
   * The line to which Griff belongs.
   *
   * @type {number}
   * @memberof TextGlyph
   */
  line: number;
}

/**
 * The enums to specify text alignment.
 *
 * @enum {number}
 */
enum TextAlign {
  /** Text aligns to left. */
  Left = 0,
  /** Text aligns to center. */
  Center = 1,
  /** Text aligns to right. */
  Right = 2,
}

/**
 * The interface to define options for `TextLayout`.
 *
 * @augments {WordWrapOption}
 * @interface TextLayoutOption
 */
interface TextLayoutOption extends WordWrapOption {
  /**
   * The BMFont definition which holds chars, kernings, etc.
   *
   * @type {BMFont}
   * @memberof TextGeometryOption
   */
  font?: BMFont;
  /**
   * The letter spacing in pixels.
   *
   * @type {number}
   * @memberof TextGeometryOption
   * @default 0
   */
  letterSpacing?: number;
  /**
   * The number of spaces to use in a single tab	.
   *
   * @type {number}
   * @memberof TextGeometryOption
   * @default 4
   */
  tabSize?: number;
  /**
   * The line height in pixels.
   *
   * @type {number}
   * @memberof TextGeometryOption
   * @default font.common.lineHeight.
   */
  lineHeight?: number;
  /**
   * This can be TextAlign.left, TextAlign.center or TextAlign.right.
   *
   * @type {TextAlign}
   * @memberof TextGeometryOption
   * @default TextAlign.left
   */
  align?: TextAlign;
}

export { TextAlign, TextGlyph, TextLayoutOption };
