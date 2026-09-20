import { BMFont, TextAlign, WordWrapMode } from '../types/index.js';

/**
 * The interface to define options for `TextGeometry`.
 *
 * @interface TextGeometryOption
 */
export interface TextGeometryOption {
  /**
   * The BMFont definition which holds chars, kernings, etc.
   *
   * @type {BMFont}
   * @memberof TextGeometryOption
   */
  font?: BMFont;
  /**
   * The starting index into the text to layout.
   *
   * @type {number}
   * @memberof WordWrapOption
   * @default 0
   */
  start?: number;
  /**
   * The ending index (exclusive) into the text to layout.
   *
   * @type {number}
   * @memberof WordWrapOption
   * @default text.length
   */
  end?: number;
  /**
   * The desired width of the text box, causes word-wrapping and clipping in WordWrapMode mode. Leave as
   * undefined to remove word-wrapping (default behaviour).
   *
   * @type {number}
   * @memberof TextGeometryOption
   * @default undefined
   */
  width?: number;
  /**
   * A mode for word-wrapper; can be WordWrapMode.Pre (maintain spacing), or WordWrapMode.NoWrap (collapse
   * whitespace but only break on newline characters), otherwise assumes normal word-wrap behaviour (collapse
   * whitespace, break at width or newlines).
   *
   * @type {WordWrapMode}
   * @memberof TextGeometryOption
   * @default undefined
   */
  mode?: WordWrapMode;
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
  /**
   * Whether the texture will be Y-flipped.
   *
   * @type {boolean}
   * @memberof TextGeometryOption
   * @default true
   */
  flipY?: boolean;
  /**
   * Whether to construct this geometry with an extra buffer containing page IDs. This is necessary for
   * multi-texture fonts.
   *
   * @type {boolean}
   * @memberof TextGeometryOption
   * @default false
   */
  multipage?: boolean;
}
