// import { TextGeometryOption } from './TextLayout.js';

/**
 * The function for computing word metrics.
 *
 * @type {ComputeMetrics}
 */
export type ComputeMetrics = (text: string, start: number, end: number, width: number) => WordMetrics;

/**
 * The word metrics computed by `ComputeMetrics` function.
 *
 * @interface WordMetrics
 */
export interface WordMetrics {
  /**
   * The start position.
   *
   * @type {number}
   * @memberof WordMetrics
   */
  start: number;
  /**
   * The end position.
   *
   * @type {number}
   * @memberof WordMetrics
   */
  end: number;
  /**
   * The width.
   *
   * @type {number}
   * @memberof WordMetrics
   */
  width: number;
}
/**
 * The enums to specify word wrapping.
 *
 * @enum {number}
 */
export enum WordWrapMode {
  /** Wrap text to pre. */
  Pre = 'pre',
  /** No wrapping. */
  NoWrap = 'nowrap',
}

/**
 * The interface to define options for `WordWrap`.
 *
 * @interface WordWrapOption
 */
export interface WordWrapOption {
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
   * The function that computes word metrics.
   *
   * @type {ComputeMetrics}
   * @memberof WordWrapOption
   */
  measure?: ComputeMetrics;
}
