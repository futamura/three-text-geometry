import { dtype } from '../utils/index.js';

/**
 * The interface to define options for `createIndices`.
 *
 * @interface QuadOptions
 */
interface QuadOptions {
  count?: number /** the number of quads to index, default 1 */;
  type?: string /** (string) the dtype of the returned array, default '"uint16"' */;
  clockwise?: boolean /** (boolean) the orientation of the indices, default true */;
  start?: number /** the starting index to place the data into the array, default 0 */;
}

type QuadIndices = Array<number> | Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Float32Array | Float64Array | Uint8ClampedArray;

/**
 * The function for creating the indices of the quads.
 *
 * @param {QuadIndices | QuadOptions | null} array - The array to store the indices.
 * @param {QuadOptions | null} opt - The options for the indices.
 * @returns {QuadIndices} The indices of the quads.
 */
function createIndices(array: QuadIndices | QuadOptions | null = null, opt: QuadOptions | null = null): QuadIndices {
  /** if user didn't specify an output array */
  let arr: QuadIndices | null;
  if (!array || !(Array.isArray(array) || ArrayBuffer.isView(array))) {
    opt = (array as QuadOptions) || {};
    arr = null;
  } else {
    arr = array as QuadIndices;
  }

  opt = opt || {};

  const type = typeof opt.type === 'string' ? opt.type : 'uint16';
  const count = opt.count !== undefined ? opt.count : 1;
  const start = opt.start !== undefined ? opt.start : 0;
  const clockwise = typeof opt.clockwise === 'boolean' ? opt.clockwise : true;

  const dir = clockwise ? [0, 2, 3] : [2, 1, 3];
  const a = dir[0] || 0;
  const b = dir[1] || 0;
  const c = dir[2] || 0;

  const numIndices = count * 6;
  const indices: QuadIndices = arr || new (dtype(type) || Uint16Array)(numIndices);
  for (let i = 0, j = 0; i < numIndices; i += 6, j += 4) {
    const x = i + start;
    indices[x + 0] = j + 0;
    indices[x + 1] = j + 1;
    indices[x + 2] = j + 2;
    indices[x + 3] = j + a;
    indices[x + 4] = j + b;
    indices[x + 5] = j + c;
  }
  return indices;
}

export { createIndices };
