import { BMFont } from '../types/index.js';

/**
 * The interface for the BMFont parser.
 *
 * @interface IBMFontParser
 */
export interface IBMFontParser<T> {
  /**
   * The function for parsing the BMFont.
   *
   * @param {T} data - The data to parse.
   * @returns {BMFont} The parsed BMFont.
   */
  parse(data: T): BMFont;
}
