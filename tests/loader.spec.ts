import fs from 'fs';
import path from 'path';
import { BMFontError } from '@three-text-geometry/error';
import { download, loadTexture, parseFont } from '@three-text-geometry/helpers/loader';
import { isBMFont } from '@three-text-geometry/types';
import { Texture, TextureLoader } from 'three';

function readLocalFile(filePath: string): Uint8Array {
  return new Uint8Array(fs.readFileSync(path.resolve(__dirname, 'fonts', filePath)));
}

// A response whose body arrives in the given chunks.
function chunkedResponse(chunks: Uint8Array[], init: ResponseInit = {}): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });
  return new Response(body, init);
}

describe('loader', () => {
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('download', () => {
    test('joins the chunks and reports progress against Content-Length', async () => {
      fetchMock.mockResolvedValue(chunkedResponse([new Uint8Array([1, 2]), new Uint8Array([3, 4, 5])], { headers: { 'content-length': '5', 'content-type': 'image/png' } }));
      const onProgress = jest.fn();

      const { bytes, contentType } = await download('https://example.com/font.png', onProgress);

      expect(fetchMock).toHaveBeenCalledWith('https://example.com/font.png');
      expect(Array.from(bytes)).toEqual([1, 2, 3, 4, 5]);
      expect(contentType).toEqual('image/png');
      expect(onProgress.mock.calls).toEqual([
        [2, 5],
        [5, 5],
      ]);
    });

    test('reports a total of 0 when the length is unknown', async () => {
      fetchMock.mockResolvedValue(chunkedResponse([new Uint8Array([1, 2, 3])]));
      const onProgress = jest.fn();

      await download('https://example.com/font.fnt', onProgress);

      expect(onProgress).toHaveBeenLastCalledWith(3, 0);
    });

    test('never reports more loaded than total for a compressed body', async () => {
      fetchMock.mockResolvedValue(chunkedResponse([new Uint8Array(4), new Uint8Array(4)], { headers: { 'content-length': '6' } }));
      const onProgress = jest.fn();

      await download('https://example.com/font.fnt', onProgress);

      expect(onProgress.mock.calls).toEqual([
        [4, 6],
        [8, 8],
      ]);
    });

    test('reads a response without a body stream', async () => {
      const response = new Response(new Uint8Array([7, 8]), { headers: { 'content-length': '2' } });
      Object.defineProperty(response, 'body', { value: null });
      fetchMock.mockResolvedValue(response);
      const onProgress = jest.fn();

      const { bytes } = await download('https://example.com/font.bin', onProgress);

      expect(Array.from(bytes)).toEqual([7, 8]);
      expect(onProgress).toHaveBeenCalledWith(2, 2);
    });

    test('rejects a non-2xx response', async () => {
      fetchMock.mockResolvedValue(new Response('missing', { status: 404 }));

      await expect(download('https://example.com/missing.fnt', jest.fn())).rejects.toThrow(new Error('Request failed with status code 404'));
    });

    test('propagates a network error', async () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(download('https://example.com/font.fnt', jest.fn())).rejects.toThrow(TypeError);
    });
  });

  describe('parseFont', () => {
    test.each([
      ['https://example.com/Roboto-Regular.xml', 'Roboto-Regular.xml'],
      ['https://example.com/Roboto-Regular.json', 'Roboto-Regular.json'],
      ['https://example.com/Lato-Regular-32.fnt', 'Lato-Regular-32.fnt'],
      ['https://example.com/Lato-Regular-32.txt', 'Lato-Regular-32.fnt'],
      ['https://example.com/Arial.BIN', 'Arial.bin'],
    ])('%s', (url, file) => {
      expect(isBMFont(parseFont(url, readLocalFile(file)))).toEqual(true);
    });

    test('rejects invalid data with a BMFontError', () => {
      expect(() => parseFont('https://example.com/Roboto-Regular-invalid.json', readLocalFile('Roboto-Regular-invalid.json'))).toThrow(BMFontError);
    });
  });

  describe('loadTexture', () => {
    test('loads an object URL typed with the response Content-Type', () => {
      const createObjectURL = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:texture');
      const texture = new Texture<HTMLImageElement>();
      const load = jest.spyOn(TextureLoader.prototype, 'load').mockReturnValue(texture);

      expect(loadTexture(new Uint8Array([1, 2, 3]), 'image/png')).toBe(texture);

      const blob = createObjectURL.mock.calls[0]![0] as Blob;
      expect(blob.type).toEqual('image/png');
      expect(blob.size).toEqual(3);
      expect(load).toHaveBeenCalledWith('blob:texture');
    });
  });
});
