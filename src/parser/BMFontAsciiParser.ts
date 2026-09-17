import { BMFontError } from '../error';
import { BMFont, BMFontChar, BMFontCommon, BMFontDistanceField, BMFontInfo, BMFontKern, DefaultBMFont, DefaultBMFontCommon, DefaultBMFontInfo, IBMFontParser } from '../types';

/**
 * The class for parsing font data in ASCII format.
 *
 * @class BMFontAsciiParser
 */
class BMFontAsciiParser implements IBMFontParser<string> {
  /**
   * The function that parses font data from an ASCII string.
   *
   * ```typescript
   * import { BMFontAsciiParser } from 'three-text-geometry'
   *
   * const data: string = ...ascii data...
   * const parser = new BMFontAsciiParser();
   * const font: BMFont = parser.parse(data)
   * ```
   *
   * @param {string} data  `string` that contains font data.
   * @returns {BMFont} Parsed data that conforms to the `BMFont` interface.
   * @memberof BMFontAsciiParser
   */
  parse(data: string): BMFont {
    data = data.trim();

    const lines: string[] = data.split(/\r\n?|\n/g);
    if (lines.length === 0) throw new BMFontError('No data in BMFont file');

    const result: BMFont = DefaultBMFont();

    lines.forEach((line: string, _index: number) => {
      line = line.trim();
      if (!line) return;

      const space = line.search(/\s/);
      if (space === -1) throw new BMFontError('No page data');

      const rootKey = line.substring(0, space);
      const keyValues: any = {};
      // Quoted values may contain whitespace and '=', so scan key=value pairs instead of splitting on spaces.
      // A single forward pass keeps parsing linear in the line length.
      const isSpace = (index: number): boolean => /\s/.test(line.charAt(index));
      let i = space + 1;
      while (i < line.length) {
        if (isSpace(i)) {
          i++;
          continue;
        }
        const keyStart = i;
        while (i < line.length && line.charAt(i) !== '=' && !isSpace(i)) i++;
        if (line.charAt(i) !== '=') continue;
        const key: string = line.substring(keyStart, i);
        i++;

        const quote = line.charAt(i);
        const quoteEnd = quote === '"' || quote === "'" ? line.indexOf(quote, i + 1) : -1;
        if (quoteEnd !== -1) {
          keyValues[key] = line.substring(i + 1, quoteEnd);
          i = quoteEnd + 1;
          continue;
        }

        const valueStart = i;
        while (i < line.length && !isSpace(i)) i++;
        const value: string = line.substring(valueStart, i);
        if (/^-?\d+(?:\.\d*)?$/.test(value)) keyValues[key] = +value;
        else if (/^-?[\d,]+/.test(value)) keyValues[key] = value.split(',').map((value) => +value);
        else keyValues[key] = value;
      }
      switch (rootKey) {
        case 'info':
          result.info = keyValues as BMFontInfo;
          break;
        case 'common':
          result.common = keyValues as BMFontCommon;
          break;
        case 'distanceField':
          result.distanceField = keyValues as BMFontDistanceField;
          break;
        case 'page':
          result.pages.push(keyValues.file);
          break;
        case 'chars':
          break;
        case 'char':
          result.chars.push(keyValues as BMFontChar);
          break;
        case 'kernings':
          break;
        case 'kerning':
          result.kernings.push(keyValues as BMFontKern);
          break;
        default:
          break;
      }
    });
    if (JSON.stringify(result.info) === JSON.stringify(DefaultBMFontInfo())) throw new BMFontError(`No info data. \n${JSON.stringify(result)}`);
    if (JSON.stringify(result.common) === JSON.stringify(DefaultBMFontCommon())) throw new BMFontError(`No common data. \n${JSON.stringify(result)}`);
    if (result.pages.length == 0) throw new BMFontError(`No page data. \n${JSON.stringify(result)}`);
    if (result.chars.length == 0) throw new BMFontError(`No char data. \n${JSON.stringify(result)}`);
    // if (result.kernings.length == 0)
    //     throw new BMFontError(`No kernings data. \n${JSON.stringify(result)}`);
    return result;
  }
}

export { BMFontAsciiParser };
