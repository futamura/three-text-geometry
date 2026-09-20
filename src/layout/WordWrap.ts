/**
 *
 * https://github.com/mattdesl/word-wrapper
 *
 */
import { ComputeMetrics, WordMetrics, WordWrapMode, WordWrapOption } from '../types/index.js';

/**
 * Class representing a word wrap.
 *
 * @class
 * @property {RegExp} newlineRegexp - The regular expression for newline characters.
 * @property {RegExp} whitespaceRegexp - The regular expression for whitespace characters.
 * @property {string} newlineChar - The character for newline.
 */
class WordWrap {
  static readonly newlineRegexp: RegExp = /\n/;
  static readonly whitespaceRegexp: RegExp = /\s/;
  static readonly newlineChar: string = '\n';

  /**
   * Wraps the text according to the specified options.
   *
   * @param {string} text - The text to wrap.
   * @param {any} [option={}] - The options for the word wrap.
   * @returns {string} The wrapped text.
   */
  wrap(text: string, option: any = {}): string {
    return this.lines(text, option)
      .map((line: WordMetrics) => text.substring(line.start, line.end))
      .join('\n');
  }

  /**
   * Wraps the text according to the specified options.
   *
   * @param {string} text - The text to wrap.
   * @param {any} [option={}] - The options for the word wrap.
   * @returns {WordMetrics[]} The wrapped text.
   */
  lines(text: string, option: any = {}): WordMetrics[] {
    /** zero width results in nothing visible */
    const opt: WordWrapOption = {
      start: undefined,
      end: undefined,
      width: undefined,
      mode: undefined,
      measure: undefined,
    };
    text = text || '';
    if (option.start !== undefined) opt.start = Math.max(0, option.start);
    else opt.start = 0;
    if (option.end !== undefined) opt.end = option.end;
    else opt.end = text.length;
    if (option.width !== undefined) opt.width = option.width;
    else opt.width = Number.MAX_VALUE;
    if (option.mode !== undefined) opt.mode = option.mode;
    opt.measure = option.measure || this.monospace;
    if (opt.width === 0 && opt.mode !== WordWrapMode.NoWrap) return [];

    if (option.mode === WordWrapMode.Pre) return this.pre(opt.measure!, text, opt.start, opt.end!, opt.width!);
    else return this.greedy(opt.measure!, text, opt.start, opt.end!, opt.width!, opt.mode!);
  }

  /**
   * Finds the index of the specified character in the text.
   *
   * @param {string} text - The text to search within.
   * @param {string} chr - The character to find.
   * @param {number} start - The starting index for the search.
   * @param {number} end - The ending index for the search.
   * @returns {number} The index of the character, or the end index if not found.
   */
  idxOf(text: string, chr: string, start: number, end: number) {
    const idx: number = text.indexOf(chr, start);
    if (idx === -1 || idx > end) return end;
    return idx;
  }

  /**
   * Checks if the specified character is a whitespace character.
   *
   * @param {string} chr - The character to check.
   * @returns {boolean} True if the character is a whitespace, false otherwise.
   */
  isWhitespace(chr: string): boolean {
    return WordWrap.whitespaceRegexp.test(chr);
  }

  /**
   * Wraps the text according to the specified options.
   *
   * @param {ComputeMetrics} measure - The function to measure the text.
   * @param {string} text - The text to wrap.
   * @param {number} start - The starting index for the text.
   * @param {number} end - The ending index for the text.
   * @param {number} width - The width to wrap the text to.
   * @returns {WordMetrics[]} The wrapped text.
   */
  pre(measure: ComputeMetrics, text: string, start: number, end: number, width: number): WordMetrics[] {
    const lines: WordMetrics[] = [];
    let lineStart: number = start;
    for (let i = start; i < end && i < text.length; i++) {
      const chr: string = text.charAt(i);
      const isNewline: boolean = WordWrap.newlineRegexp.test(chr);
      /** If we've reached a newline, then step down a line */
      /** Or if we've reached the EOF */
      if (isNewline || i === end - 1) {
        const lineEnd: number = isNewline ? i : i + 1;
        const measured: WordMetrics = measure(text, lineStart, lineEnd, width);
        lines.push(measured);
        lineStart = i + 1;
      }
    }
    return lines;
  }

  /**
   * Wraps the text according to the specified options.
   *
   * @param {ComputeMetrics} measure - The function to measure the text.
   * @param {string} text - The text to wrap.
   * @param {number} start - The starting index for the text.
   * @param {number} end - The ending index for the text.
   * @param {number} width - The width to wrap the text to.
   * @param {string} mode - The mode to wrap the text.
   * @returns {WordMetrics[]} The wrapped text.
   */
  greedy(measure: ComputeMetrics, text: string, start: number, end: number, width: number, mode: string): WordMetrics[] {
    /** A greedy word wrapper based on LibGDX algorithm */
    /** https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/BitmapFontCache.java */
    const lines: WordMetrics[] = [];

    let testWidth: number = width;
    /** if WordWrapMode.NoWrap is specified, we only wrap on newline chars */
    if (mode === WordWrapMode.NoWrap) testWidth = Number.MAX_VALUE;

    while (start < end && start < text.length) {
      /** get next newline position */
      const newLine: number = this.idxOf(text, WordWrap.newlineChar, start, end);

      /** eat whitespace at start of line */
      while (start < newLine) {
        if (!this.isWhitespace(text.charAt(start))) break;
        start++;
      }

      /** determine visible # of glyphs for the available width */
      const measured: WordMetrics = measure(text, start, newLine, testWidth);

      let lineEnd: number = start + (measured.end - measured.start);
      let nextStart: number = lineEnd + WordWrap.newlineChar.length;

      /** if we had to cut the line before the next newline... */
      if (lineEnd < newLine) {
        /** find char to break on */
        while (lineEnd > start) {
          if (this.isWhitespace(text.charAt(lineEnd))) break;
          lineEnd--;
        }
        if (lineEnd === start) {
          if (nextStart > start + WordWrap.newlineChar.length) nextStart--;
          lineEnd = nextStart; /**  If no characters to break, show all. */
        } else {
          nextStart = lineEnd;
          /** eat whitespace at end of line */
          while (lineEnd > start) {
            if (!this.isWhitespace(text.charAt(lineEnd - WordWrap.newlineChar.length))) break;
            lineEnd--;
          }
        }
      }
      if (lineEnd >= start) {
        lines.push(measure(text, start, lineEnd, testWidth));
      }
      start = nextStart;
    }
    return lines;
  }

  /**
   * Determines the visible number of glyphs within a given width.
   *
   * @param {string} _ - The text to measure.
   * @param {number} start - The starting index for the text.
   * @param {number} end - The ending index for the text.
   * @param {number} width - The width to measure.
   * @returns {WordMetrics} The measured word metrics.
   */
  monospace(_: string, start: number, end: number, width: number): WordMetrics {
    const glyphs: number = Math.min(width, end - start);
    return {
      start: start,
      end: start + glyphs,
      width: 0,
    };
  }
}

export { WordWrap };
