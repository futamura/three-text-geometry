import { XMLParser } from 'fast-xml-parser';

import { BMFontError } from '../error/index.js';
import { BMFont, BMFontChar, BMFontCommon, BMFontInfo, BMFontKern, DefaultBMFontDistanceField, IBMFontParser } from '../types/index.js';
import { normalizeCharset } from './charset.js';

/**
 * Reads a list that fast-xml-parser leaves unwrapped when it holds a single element, and that is
 * missing altogether when the document omits its section.
 *
 * @param {T | T[] | undefined} value - The parsed `<char>`, `<kerning>` or `<page>` elements.
 * @returns {T[]} The elements as an array, empty when the section was absent.
 */
function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * The class for parsing font data in XML format.
 *
 * @class BMFontXMLParser
 */
class BMFontXMLParser implements IBMFontParser<string> {
  /**
   * The function that parses font data from a XML string.
   *
   * ```typescript
   * import { BMFontXMLParser } from 'three-text-geometry'
   *
   * const data: string = ...xml data...
   * const parser = new BMFontXMLParser();
   * const font: BMFont = parser.parse(data)
   * ```
   *
   * @param {string} xml  `string` that contains font data.
   * @returns {BMFont} Parsed data that conforms to the `BMFont` interface.
   * @memberof BMFontXMLParser
   */
  public parse(xml: string): BMFont {
    try {
      const options = {
        ignoreAttributes: false,
        attributeNamePrefix: '',
        // A quoted value keeps its whitespace, the way BMFontAsciiParser keeps it: the space glyph
        // is written as char=" " and would otherwise arrive as an empty string.
        trimValues: false,
      };
      const parser = new XMLParser(options);
      const json: any = parser.parse(xml);
      const font = json.font;
      if (!font) throw new BMFontError('No font data in BMFont file');
      if (!font.pages) throw new BMFontError('No font data in BMFont file');
      if (!font.chars) throw new BMFontError('No chars data in BMFont file');
      if (!font.info) throw new BMFontError('No info data in BMFont file');
      if (!font.common) throw new BMFontError('No common data in BMFont file');

      const pages: string[] = toArray<any>(font.pages.page).map((element: any) => element.file);

      // Attributes arrive as strings. The layout matches glyphs with `===` against a numeric id and
      // does arithmetic on the metrics, so an uncoerced char makes an XML font lay out nothing at
      // all. Every field but `char` is converted the way the kernings below are.
      const chars: BMFontChar[] = toArray<any>(font.chars.char).map(
        (element: any) =>
          ({
            id: +element.id || 0,
            index: +element.index || 0,
            char: `${element.char ?? ''}`,
            width: +element.width || 0,
            height: +element.height || 0,
            xoffset: +element.xoffset || 0,
            yoffset: +element.yoffset || 0,
            xadvance: +element.xadvance || 0,
            chnl: +element.chnl || 0,
            x: +element.x || 0,
            y: +element.y || 0,
            page: +element.page || 0,
          }) as BMFontChar,
      );

      const info: BMFontInfo = {
        face: font.info.face,
        size: +font.info.size || 0,
        bold: +font.info.bold || 0,
        italic: +font.info.italic || 0,
        charset: normalizeCharset(font.info.charset),
        unicode: +font.info.unicode || 0,
        stretchH: +font.info.stretchH || 0,
        smooth: +font.info.smooth || 0,
        aa: +font.info.aa || 0,
        padding: font.info.padding.split(',').map((element: any) => +element),
        spacing: font.info.spacing.split(',').map((element: any) => +element),
        fixedHeight: +font.info.fixedHeight || 0,
        outline: +font.info.outline || 0,
      };

      const common: BMFontCommon = {
        lineHeight: +font.common.lineHeight || 0,
        base: +font.common.base || 0,
        scaleW: +font.common.scaleW || 0,
        scaleH: +font.common.scaleH || 0,
        pages: +font.common.pages || 0,
        packed: +font.common.packed || 0,
        alphaChnl: +font.common.alphaChnl || 0,
        redChnl: +font.common.redChnl || 0,
        greenChnl: +font.common.greenChnl || 0,
        blueChnl: +font.common.blueChnl || 0,
      };

      // A font with no kerning pairs writes no <kernings> at all, and only SDF and MSDF generators
      // write a <distanceField>. Both are absent from a plain BMFont document, so both default the
      // way the JSON parser defaults them.
      const kernings: BMFontKern[] = toArray<any>(font.kernings?.kerning).map(
        (element: any) =>
          ({
            first: +element.first || 0,
            second: +element.second || 0,
            amount: +element.amount || 0,
          }) as BMFontKern,
      );

      const distanceField = font.distanceField
        ? {
            fieldType: font.distanceField.fieldType,
            distanceRange: +font.distanceField.distanceRange || 0,
          }
        : DefaultBMFontDistanceField();

      const bmFont: BMFont = {
        pages: pages,
        chars: chars,
        info: info,
        common: common,
        kernings: kernings,
        distanceField: distanceField,
      };
      return bmFont;
    } catch (error: any) {
      throw new BMFontError(error.message);
    }
  }
}

export { BMFontXMLParser };
