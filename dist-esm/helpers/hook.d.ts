import { Texture } from 'three';
import { BMFont } from '../types/index.js';
interface FontProgressCallback {
    (loaded: number, total: number, percent: number): void;
}
declare const useFont: (fontUrl?: string | null, textureUrl?: string | null, onProgress?: FontProgressCallback | null) => {
    font: BMFont;
    texture: Texture;
    fontError: Error | null;
    textureError: Error | null;
    isLoading: boolean;
};
export { useFont, FontProgressCallback };
//# sourceMappingURL=hook.d.ts.map