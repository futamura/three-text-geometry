import { Texture } from 'three';
import { BMFont } from '../types/index.js';
type DownloadProgressHandler = (loaded: number, total: number) => void;
declare function download(url: string, onProgress: DownloadProgressHandler): Promise<{
    bytes: Uint8Array;
    contentType: string | null;
}>;
declare function parseFont(url: string, bytes: Uint8Array): BMFont;
declare function loadTexture(bytes: Uint8Array, contentType: string | null): Texture;
export { DownloadProgressHandler, download, loadTexture, parseFont };
//# sourceMappingURL=loader.d.ts.map