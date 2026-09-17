import { Texture, TextureLoader } from 'three';

import { BMFontAsciiParser, BMFontBinaryParser, BMFontJsonParser, BMFontXMLParser } from '../parser';
import { BMFont } from '../types';

/**
 * Receives the bytes read so far and the expected total, which is 0 when the response does not declare its length.
 */
type DownloadProgressHandler = (loaded: number, total: number) => void;

/**
 * Downloads a resource and reports progress while its body is read.
 *
 * A non-2xx response rejects, with the same message axios used before this was ported to `fetch`.
 *
 * @param {string} url - The URL to download.
 * @param {DownloadProgressHandler} onProgress - Called after each chunk is read.
 * @returns {Promise<{ bytes: Uint8Array; contentType: string | null }>} The response body and its `Content-Type`.
 */
async function download(url: string, onProgress: DownloadProgressHandler): Promise<{ bytes: Uint8Array; contentType: string | null }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed with status code ${res.status}`);
  const contentType = res.headers.get('content-type');
  const declared = Number(res.headers.get('content-length'));
  // Content-Length counts encoded bytes, so a compressed body can read past it.
  const totalFor = (loaded: number): number => (Number.isFinite(declared) && declared > 0 ? Math.max(declared, loaded) : 0);

  if (!res.body) {
    const bytes = new Uint8Array(await res.arrayBuffer());
    onProgress(bytes.byteLength, totalFor(bytes.byteLength));
    return { bytes, contentType };
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.byteLength;
    onProgress(loaded, totalFor(loaded));
  }

  const bytes = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { bytes, contentType };
}

/**
 * Parses downloaded font data with the parser that matches the URL's extension.
 *
 * @param {string} url - The URL the data came from.
 * @param {Uint8Array} bytes - The downloaded data.
 * @returns {BMFont} The parsed font.
 */
function parseFont(url: string, bytes: Uint8Array): BMFont {
  const extension = url.split('.').pop()?.toLowerCase();
  if (extension === 'bin') return new BMFontBinaryParser().parse(bytes);
  const text = new TextDecoder('utf-8').decode(bytes);
  switch (extension) {
    case 'xml':
      return new BMFontXMLParser().parse(text);
    case 'json':
      return new BMFontJsonParser().parse(text);
    case 'fnt':
      return new BMFontAsciiParser().parse(text);
    default:
      return new BMFontAsciiParser().parse(text);
  }
}

/**
 * Downloads a texture image and loads it into a `Texture`.
 *
 * @param {Uint8Array} bytes - The downloaded image.
 * @param {string | null} contentType - The response `Content-Type`.
 * @returns {Texture} The texture.
 */
function loadTexture(bytes: Uint8Array, contentType: string | null): Texture {
  const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], { type: contentType ?? undefined });
  const imageUrl = URL.createObjectURL(blob);
  return new TextureLoader().load(imageUrl);
}

export { DownloadProgressHandler, download, loadTexture, parseFont };
