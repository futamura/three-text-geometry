/**
 * Ambient module declarations for Three.js WebGPU and TSL subpath imports.
 *
 * These are needed because tsconfig.json - the config Jest and the editor use -
 * leaves moduleResolution at node10, which does not read a package.json exports
 * field. The build uses moduleResolution: "nodenext" and resolves these
 * natively; the declarations are harmless there (native resolution wins).
 *
 * @module three-webgpu
 */

declare module 'three/webgpu' {
  export * from 'three/src/Three.WebGPU.js';
}

declare module 'three/tsl' {
  export * from 'three/src/Three.TSL.js';
}
