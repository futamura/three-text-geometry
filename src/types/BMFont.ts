/**
 * This interface defines BMFont.
 *
 * @interface BMFont
 */
interface BMFont {
  /**
   * The array to store `BMFontChar`.
   *
   * @type {string[]}
   * @memberof BMFont
   */
  pages: string[];
  chars: BMFontChar[];
  /**
   * The value to store `BMFontInfo`.
   *
   * @type {BMFontInfo}
   * @memberof BMFont
   */
  info: BMFontInfo;
  /**
   * The value to store `BMFontCommon`.
   *
   * @type {BMFontCommon}
   * @memberof BMFont
   */
  common: BMFontCommon;
  /**
   * The value to store `BMFontDistanceField`.
   *
   * @type {BMFontDistanceField}
   * @memberof BMFont
   */
  distanceField: BMFontDistanceField;
  /**
   * The array to store `BMFontKern`.
   *
   * @type {BMFontKern[]}
   * @memberof BMFont
   */
  kernings: BMFontKern[];
}

/**
 * This interface defines BMFontChar.
 *
 * @interface BMFontChar
 */
interface BMFontChar {
  /**
   * The character id.
   *
   * @type {number}
   * @memberof BMFontChar
   */
  id: number;
  /**
   * The character index.
   *
   * @type {number}
   * @memberof BMFontChar
   */
  index: number;
  /**
   * The character string.
   *
   * @type {string}
   * @memberof BMFontChar
   */
  char: string;
  /**
   * The width of the character image in the texture.
   *
   * @type {number}
   * @memberof BMFontChar
   */
  width: number;
  /**
   * The height of the character image in the texture.
   *
   * @type {number}
   * @memberof BMFontChar
   */
  height: number;
  /**
   * How much the current position should be offset when copying the image from the texture to the screen.
   *
   * @type {number}
   * @memberof BMFontChar
   */
  xoffset: number;
  /**
   * How much the current position should be offset when copying the image from the texture to the screen.
   *
   * @type {number}
   * @memberof BMFontChar
   */
  yoffset: number;
  /**
   * How much the current position should be advanced after drawing the character.
   *
   * @type {number}
   * @memberof BMFontChar
   */
  xadvance: number;
  /**
   * The texture channel where the character image is found (1 = blue, 2 = green, 4 = red, 8 = alpha, 15 = all
   * channels).
   *
   * @type {number}
   * @memberof BMFontChar
   */
  chnl: number;
  /**
   * The left position of the character image in the texture.
   *
   * @type {number}
   * @memberof BMFontChar
   */
  x: number;
  /**
   * The top position of the character image in the texture.
   *
   * @type {number}
   * @memberof BMFontChar
   */
  y: number;
  /**
   * The number of texture pages included in the font.
   *
   * @type {number}
   * @memberof BMFontChar
   */
  page: number;
}

/**
 * This interface defines BMFontInfo.
 *
 * @interface BMFontInfo
 */
interface BMFontInfo {
  /**
   * This is the name of the true type font.
   *
   * @type {string}
   * @memberof BMFontInfo
   */
  face: string;
  /**
   * The size of the true type font.
   *
   * @type {number}
   * @memberof BMFontInfo
   */
  size: number;
  /**
   * The font is bold.
   *
   * @type {number}
   * @memberof BMFontInfo
   */
  bold: number;
  /**
   * The font is italic.
   *
   * @type {string[]}
   * @memberof BMFontInfo
   */
  italic: number;
  /**
   * The charset of the font, normalized to a single shape by every parser.
   *
   * A source that carries a `string` - an ASCII `.fnt`, an XML font, or a JSON font that names its
   * charset - is read as the comma-separated list of names the BMFont spec describes, so `"ANSI"`
   * gives `['ANSI']` and `""` gives `[]`. A JSON font that carries the list of generated characters
   * keeps it. A binary font always gives `[]`; the charset byte is not read.
   *
   * @type {string[]}
   * @memberof BMFontInfo
   */
  charset: string[];
  /**
   * Set to 1 if it is the unicode charset.
   *
   * @type {number}
   * @memberof BMFontInfo
   */
  unicode: number;
  /**
   * The font height stretch in percentage. 100% means no stretch.
   *
   * @type {number}
   * @memberof BMFontInfo
   */
  stretchH: number;
  /**
   * Set to 1 if smoothing was turned on.
   *
   * @type {number}
   * @memberof BMFontInfo
   */
  smooth: number;
  /**
   * The supersampling level used. 1 means no supersampling was used.
   *
   * @type {number}
   * @memberof BMFontInfo
   */
  aa: number;
  /**
   * The padding for each character (up, right, down, left).
   *
   * @type {number[]}
   * @memberof BMFontInfo
   */
  padding: number[];
  /**
   * The spacing for each character (horizontal, vertical).
   *
   * @type {number[]}
   * @memberof BMFontInfo
   */
  spacing: number[];
  /**
   * The fixed font height.
   *
   * @type {number}
   * @memberof BMFontInfo
   */
  fixedHeight: number;
  /**
   * The outline thickness for the characters.
   *
   * @type {number}
   * @memberof BMFontInfo
   */
  outline: number;
}

/**
 * This interface defines BMFontCommon.
 *
 * @interface BMFontCommon
 */
interface BMFontCommon {
  /**
   * This is the distance in pixels between each line of text.
   *
   * @type {number}
   * @memberof BMFontCommon
   */
  lineHeight: number;
  /**
   * The number of pixels from the absolute top of the line to the base of the characters.
   *
   * @type {number}
   * @memberof BMFontCommon
   */
  base: number;
  /**
   * The width of the texture, normally used to scale the x pos of the character image.
   *
   * @type {number}
   * @memberof BMFontCommon
   */
  scaleW: number;
  /**
   * The height of the texture, normally used to scale the y pos of the character image.
   *
   * @type {number}
   * @memberof BMFontCommon
   */
  scaleH: number;
  /**
   * The number of texture pages included in the font.
   *
   * @type {number}
   * @memberof BMFontCommon
   */
  pages: number;
  /**
   * Set to 1 if the monochrome characters have been packed into each of the texture channels. In this case
   * alphaChnl describes what is stored in each channel.
   *
   * @type {number}
   * @memberof BMFontCommon
   */
  packed: number;
  /**
   * Set to 0 if the channel holds the glyph data, 1 if it holds the outline, 2 if it holds the glyph and the
   * outline, 3 if its set to zero, and 4 if its set to one.
   *
   * @type {number}
   * @memberof BMFontCommon
   */
  alphaChnl: number;
  /**
   * Set to 0 if the channel holds the glyph data, 1 if it holds the outline, 2 if it holds the glyph and the
   * outline, 3 if its set to zero, and 4 if its set to one.
   *
   * @type {number}
   * @memberof BMFontCommon
   */
  redChnl: number;
  /**
   * Set to 0 if the channel holds the glyph data, 1 if it holds the outline, 2 if it holds the glyph and the
   * outline, 3 if its set to zero, and 4 if its set to one.
   *
   * @type {number}
   * @memberof BMFontCommon
   */
  greenChnl: number;
  /**
   * Set to 0 if the channel holds the glyph data, 1 if it holds the outline, 2 if it holds the glyph and the
   * outline, 3 if its set to zero, and 4 if its set to one.
   *
   * @type {number}
   * @memberof BMFontCommon
   */
  blueChnl: number;
}

/**
 * This interface defines BMFontDistanceField.
 *
 * @interface BMFontDistanceField
 */
interface BMFontDistanceField {
  /**
   * Unused value.
   *
   * @type {string}
   * @memberof BMFontDistanceField
   */
  fieldType: string;
  /**
   * Unused value.
   *
   * @type {number}
   * @memberof BMFontDistanceField
   */
  distanceRange: number;
}

/**
 * This interface defines BMFontKern.
 *
 * @interface BMFontKern
 */
interface BMFontKern {
  /**
   * The first character id.
   *
   * @type {number}
   * @memberof BMFontKern
   */
  first: number;
  /**
   * The second character id.
   *
   * @type {number}
   * @memberof BMFontKern
   */
  second: number;
  /**
   * How much the x position should be adjusted when drawing the second character immediately following the
   * first.
   *
   * @type {number}
   * @memberof BMFontKern
   */
  amount: number;
}

export { BMFont, BMFontChar, BMFontCommon, BMFontDistanceField, BMFontInfo, BMFontKern };
