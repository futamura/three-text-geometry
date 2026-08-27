import { ComputeMetrics, WordMetrics } from '../types';
declare class WordWrap {
    static readonly newlineRegexp: RegExp;
    static readonly whitespaceRegexp: RegExp;
    static readonly newlineChar: string;
    wrap(text: string, option?: any): string;
    lines(text: string, option?: any): WordMetrics[];
    idxOf(text: string, chr: string, start: number, end: number): number;
    isWhitespace(chr: string): boolean;
    pre(measure: ComputeMetrics, text: string, start: number, end: number, width: number): WordMetrics[];
    greedy(measure: ComputeMetrics, text: string, start: number, end: number, width: number, mode: string): WordMetrics[];
    monospace(_: string, start: number, end: number, width: number): WordMetrics;
}
export { WordWrap };
//# sourceMappingURL=WordWrap.d.ts.map