import { useRef } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import { Texture, TextureLoader } from 'three';

import { BMFontAsciiParser, BMFontBinaryParser, BMFontJsonParser, BMFontXMLParser } from '../parser';
import { BMFont } from '../types';

interface FontProgressCallback {
  (loaded: number, total: number, percent: number): void;
}

/**
 * Custom hook to load a font and its texture.
 *
 * @param {string} fontUrl - The URL of the font file.
 * @param {string} textureUrl - The URL of the texture file.
 * @param {FontProgressCallback} onProgress - The function to call with the progress of the font file download.
 * @returns { { font: BMFont; texture: Texture; isLoading: boolean } } - The font data, texture, and loading state.
 */
const useFont = (fontUrl: string | null = null, textureUrl: string | null = null, onProgress: FontProgressCallback | null = null): { font: BMFont; texture: Texture; fontError: Error | null; textureError: Error | null; isLoading: boolean } => {
  /*********************************
   * Refs
   *********************************/

  const callbackRef = useRef(onProgress);

  /*********************************
   * State
   *********************************/

  /** Total number of items to load. */
  const totalItems = 2;
  /** Bytes loaded for each item. */
  const itemBytesLoaded = useRef(new Array<number>(totalItems).fill(0));
  /** Bytes total for each item. */
  const itemBytesTotal = useRef(new Array<number>(totalItems).fill(0));
  /** Sum of bytes loaded. */
  const sumBytesLoaded = useRef(0);
  /** Sum of bytes total. */
  const sumBytesTotal = useRef(0);
  /** Sum percent completed. */
  const sumPercentCompleted = useRef(0);
  /** Number of completed items. */
  const numCompleted = useRef(0);

  /*********************************
   * Loaders
   *********************************/

  const {
    data: font,
    error: fontError,
    isLoading: isFontLoading,
  } = useSWR(fontUrl, (url) => fontFetcher(url, 0), {
    // suspense: true,
    // revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const {
    data: texture,
    error: textureError,
    isLoading: isTextureLoading,
  } = useSWR(textureUrl, (url) => textureFetcher(url, 1), {
    // suspense: true,
    // revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  /*********************************
   * Fetchers
   *********************************/

  const fontFetcher = async (url: string | null, loadIndex: number): Promise<BMFont | null> => {
    if (!url) return null;
    return axios
      .get(url, {
        onDownloadProgress: async (progressEvent) => {
          calculateProgress(loadIndex, progressEvent.loaded, progressEvent.total ?? 0, url);
        },
      })
      .then(async (res) => {
        numCompleted.current++;
        calculateProgress(loadIndex, itemBytesTotal.current[loadIndex]!, itemBytesTotal.current[loadIndex]!, url);
        const text = res.data;
        const extension = url.split('.').pop()?.toLowerCase();
        switch (extension) {
          case 'xml':
            return new BMFontXMLParser().parse(text);
          case 'bin':
            return new BMFontBinaryParser().parse(Buffer.from(text, 'utf-8'));
          case 'json':
            return new BMFontJsonParser().parse(text);
          case 'fnt':
            return new BMFontAsciiParser().parse(text);
          default:
            return new BMFontAsciiParser().parse(text);
        }
      });
  };

  const textureFetcher = async (url: string | null, loadIndex: number): Promise<Texture | null> => {
    if (!url) return null;
    return axios
      .get(url, {
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'image/*',
        },
        onDownloadProgress: async (progressEvent) => {
          calculateProgress(loadIndex, progressEvent.loaded, progressEvent.total ?? 0, url);
        },
      })
      .then(async (res) => {
        numCompleted.current++;
        calculateProgress(loadIndex, itemBytesTotal.current[loadIndex]!, itemBytesTotal.current[loadIndex]!, url);
        const contentType = res.headers['content-type'];
        const blob = new Blob([res.data], { type: typeof contentType === 'string' ? contentType : undefined });
        const imageUrl = URL.createObjectURL(blob);
        return new TextureLoader().load(imageUrl);
      });
  };

  /*********************************
   * Progress
   *********************************/

  /**
   * Update the progress of the loading.
   *
   * @param {number} index - The index of the data.
   * @param {number} loaded - The loaded bytes.
   * @param {number} total - The total bytes.
   * @param {string} _url - The URL of the item.
   */
  const calculateProgress = (index: number, loaded: number, total: number, _url: string) => {
    /** Update the loaded and total bytes for the item. */
    itemBytesLoaded.current[index] = loaded;
    itemBytesTotal.current[index] = total;

    /** Check how many items have started loading. */
    const numLoadStarted = itemBytesTotal.current.filter((value) => value !== 0).length;
    const ratioLoadStarted = numLoadStarted / totalItems;

    /** Update the loaded and total bytes for the sum. */
    sumBytesLoaded.current = itemBytesLoaded.current.reduce((acc: number, curr: number) => acc + curr, 0);
    sumBytesTotal.current = itemBytesTotal.current.reduce((acc: number, curr: number) => acc + curr, 0);

    if (sumBytesTotal.current === 0) return;
    sumPercentCompleted.current = Math.round((sumBytesLoaded.current * 100) / sumBytesTotal.current) * ratioLoadStarted;

    callbackRef.current?.(sumBytesLoaded.current, sumBytesTotal.current, sumPercentCompleted.current);
  };

  /*********************************
   * Result Hook
   *********************************/

  return {
    font: font as BMFont,
    texture: texture as Texture,
    fontError,
    textureError,
    isLoading: isFontLoading || isTextureLoading,
  };
};

export { useFont, FontProgressCallback };
