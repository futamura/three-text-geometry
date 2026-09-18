/**
 * @jest-environment jsdom
 */
import * as fs from 'fs';
import { createElement, ReactNode } from 'react';
import { configure, renderHook, waitFor } from '@testing-library/react';
import { useFont } from '@three-text-geometry/helpers/hook';
import { download, loadTexture, parseFont } from '@three-text-geometry/helpers/loader';
import { BMFontAsciiParser } from '@three-text-geometry/parser';
import { BMFont } from '@three-text-geometry/types';
import { SWRConfig } from 'swr';
import { Texture } from 'three';

// The loader is covered by loader.spec.ts against a real fetch; jsdom has neither fetch nor
// TextDecoder, and mocking it here keeps these tests about the hook's own wiring.
jest.mock('@three-text-geometry/helpers/loader');

// Every wait here is condition-based: the hook settles in about a tenth of a second when nothing is
// wrong, and the timeout exists only so a broken hook fails instead of hanging. The 1s default that
// @testing-library/react ships is close enough to the loaded-machine cost of this suite to expire on
// a healthy run, so both limits are raised well past it. Jest's own timeout has to clear the wait,
// or it would be the one to fire first.
configure({ asyncUtilTimeout: 10000 });
jest.setTimeout(30000);

const FONT_URL = 'https://example.com/Lato-Regular-64.fnt';
const TEXTURE_URL = 'https://example.com/lato.png';
const FONT_BYTES = 400;
const TEXTURE_BYTES = 600;

const downloadMock = download as jest.MockedFunction<typeof download>;
const parseFontMock = parseFont as jest.MockedFunction<typeof parseFont>;
const loadTextureMock = loadTexture as jest.MockedFunction<typeof loadTexture>;

/**
 * SWR keeps its cache in module state, so every render gets a fresh provider.
 *
 * @param {{ children: ReactNode }} props - The hook under test, as rendered by `renderHook`.
 * @returns {ReactElement} The children wrapped in an isolated SWR cache.
 */
function wrapper({ children }: { children: ReactNode }) {
  return createElement(SWRConfig, { value: { provider: () => new Map() } }, children);
}

describe('useFont', () => {
  let font: BMFont;
  let texture: Texture;

  beforeEach(() => {
    font = new BMFontAsciiParser().parse(fs.readFileSync('tests/fonts/Lato-Regular-64.fnt').toString());
    texture = new Texture();

    // Report half the bytes, then the rest, so the hook has to aggregate two items over time.
    downloadMock.mockImplementation(async (url, onProgress) => {
      const total = url === FONT_URL ? FONT_BYTES : TEXTURE_BYTES;
      onProgress(total / 2, total);
      onProgress(total, total);
      return { bytes: new Uint8Array(total), contentType: url === FONT_URL ? 'text/plain' : 'image/png' };
    });
    parseFontMock.mockReturnValue(font);
    loadTextureMock.mockReturnValue(texture);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('returns the parsed font, the texture and progress over both items', async () => {
    const onProgress = jest.fn();
    const { result } = renderHook(() => useFont(FONT_URL, TEXTURE_URL, onProgress), { wrapper });

    expect(result.current.isLoading).toEqual(true);

    await waitFor(() => expect(result.current.isLoading).toEqual(false));

    expect(result.current.font).toBe(font);
    expect(result.current.texture).toBe(texture);
    expect(result.current.fontError).toBeUndefined();
    expect(result.current.textureError).toBeUndefined();
    expect(parseFontMock).toHaveBeenCalledWith(FONT_URL, expect.any(Uint8Array));
    expect(loadTextureMock).toHaveBeenCalledWith(expect.any(Uint8Array), 'image/png');

    // Both items finished, so the last call covers every byte of both and reports 100%.
    const calls = onProgress.mock.calls;
    expect(calls[calls.length - 1]).toEqual([FONT_BYTES + TEXTURE_BYTES, FONT_BYTES + TEXTURE_BYTES, 100]);
    // While only one item had started, the percentage was halved by the started-items ratio.
    expect(calls[0]).toEqual([FONT_BYTES / 2, FONT_BYTES, 25]);
  });

  test('does not download while the urls are null', () => {
    const { result } = renderHook(() => useFont(null, null, null), { wrapper });

    expect(downloadMock).not.toHaveBeenCalled();
    expect(result.current.isLoading).toEqual(false);
    expect(result.current.font).toBeUndefined();
    expect(result.current.texture).toBeUndefined();
  });

  test('defaults every argument to null', () => {
    const { result } = renderHook(() => useFont(), { wrapper });

    expect(downloadMock).not.toHaveBeenCalled();
    expect(result.current.isLoading).toEqual(false);
  });

  test('loads the texture without a progress callback', async () => {
    const { result } = renderHook(() => useFont(null, TEXTURE_URL), { wrapper });

    await waitFor(() => expect(result.current.texture).toBe(texture));

    expect(downloadMock).toHaveBeenCalledTimes(1);
    expect(result.current.font).toBeUndefined();
  });

  test('reports a failed font download through fontError and still loads the texture', async () => {
    downloadMock.mockImplementation(async (url) => {
      if (url === FONT_URL) throw new Error('Request failed with status code 404');
      return { bytes: new Uint8Array(TEXTURE_BYTES), contentType: 'image/png' };
    });

    const { result } = renderHook(() => useFont(FONT_URL, TEXTURE_URL, null), { wrapper });

    await waitFor(() => expect(result.current.fontError).toBeDefined());

    expect(result.current.fontError?.message).toEqual('Request failed with status code 404');
    expect(result.current.font).toBeUndefined();
    await waitFor(() => expect(result.current.texture).toBe(texture));
    expect(result.current.isLoading).toEqual(false);
  });
});
