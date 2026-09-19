/** @type {Partial<import('typedoc').TypeDocOptions>} */

const config = {
  plugin: [
    "typedoc-plugin-merge-modules"
  ],
  out: "docs",
  entryPoints: ["./src/index.ts", "./src/tsl.ts"],
  customCss: "typedoc.css",
  entryPointStrategy: "expand",
  mergeModulesMergeMode: "module",
  excludePrivate: true,
  excludeProtected: true,
  excludeInternal: true,
  categorizeByGroup: true,
  cleanOutputDir: true
}

export default config;