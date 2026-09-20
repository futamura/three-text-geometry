#!/usr/bin/env node
/**
 * Loads the committed dist the way Node loads it, through the package's own `exports`.
 *
 * Node's ESM resolver takes specifiers literally: it appends no extension and
 * reads no directory index. `tsc` never rewrites a specifier, so an
 * extensionless `./TextGeometry` or a barrel `../types` in src reaches
 * dist-esm unchanged and `import 'three-text-geometry'` dies with
 * ERR_MODULE_NOT_FOUND - which is what 5.0.10 shipped. Bundlers resolve it
 * anyway, so neither Jest (which compiles src) nor verify-tree-shaking (which
 * bundles with esbuild) can see it. Only Node's own resolver can.
 *
 * `moduleResolution: "nodenext"` now rejects a missing extension at compile
 * time, but the dist is committed rather than built at release, so the checks
 * below are what prove the *published* files load.
 *
 * Three checks, in order of how early they catch a regression:
 *
 *   1. Every relative specifier in dist-esm carries a file extension. This
 *      covers modules no entry point reaches, which the probes below cannot.
 *   2. `import 'three-text-geometry'` and `import 'three-text-geometry/tsl'`
 *      load in a real Node process and expose what they should.
 *   3. `require` of both entry points does the same. Since 6.0.0 there is no
 *      CommonJS build, so this is `require(esm)` - supported from Node 22.12,
 *      and the reason this package can drop dist-cjs without cutting off CJS
 *      callers. It fails the moment anything introduces a top-level await.
 *
 * The probes run in a scratch directory that links the repo in as a dependency,
 * so `exports` is what resolves the entry points, not a relative path. Node
 * follows the link back to the repo before resolving the package's own
 * dependencies, so they come from the repo's node_modules as usual.
 *
 * To confirm the check still detects the defect, restore dist-esm from a commit
 * before the fix (`git checkout <commit> -- dist-esm`) and run it: the ESM probe
 * fails with ERR_MODULE_NOT_FOUND.
 *
 * Usage: node scripts/verify-node-resolution.mjs
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))

/* `require("x")`, `import("x")` and `from"x"`, as uglify leaves them - no space, either quote. */
const SPECIFIER = /(?:require|import)\s*\(\s*["']([^"']+)["']\s*\)|(?:from|import)\s*["']([^"']+)["']/g
const EXTENSION = /\.(js|mjs|cjs|json|node)$/

/**
 * The relative specifiers under a dist directory that Node's ESM resolver cannot resolve.
 *
 * @param {string} dir Directory to walk, relative to the repo root.
 * @returns {Array<[string, string]>} Repo-relative file and the specifier it carries.
 */
function extensionlessSpecifiers(dir) {
  const found = []
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        walk(full)
        continue
      }
      if (!entry.name.endsWith('.js')) continue
      for (const match of fs.readFileSync(full, 'utf8').matchAll(SPECIFIER)) {
        const specifier = match[1] ?? match[2]
        if (!specifier.startsWith('.')) continue
        if (EXTENSION.test(specifier)) continue
        found.push([path.relative(root, full), specifier])
      }
    }
  }
  walk(path.join(root, dir))
  return found
}

/* Resolve the package by name, the way a consumer does, by linking it into a scratch node_modules. */
const consumer = fs.mkdtempSync(path.join(os.tmpdir(), 'ttg-node-resolution-'))
fs.mkdirSync(path.join(consumer, 'node_modules'))
fs.symlinkSync(root, path.join(consumer, 'node_modules', pkg.name), 'dir')

const probes = [
  {
    name: `import '${pkg.name}' and '${pkg.name}/tsl' load in Node`,
    file: 'probe.mjs',
    source: [
      `import TextGeometry, { BMFontJsonParser, TextAlign } from '${pkg.name}';`,
      `import { MSDFTextNodeMaterial } from '${pkg.name}/tsl';`,
      `const problems = [`,
      `  typeof TextGeometry === 'function' || 'the default export is not a class',`,
      `  typeof BMFontJsonParser === 'function' || 'BMFontJsonParser is missing from the root entry',`,
      `  TextAlign?.Left === 0 || 'TextAlign is missing from the root entry',`,
      `  typeof MSDFTextNodeMaterial === 'function' || 'MSDFTextNodeMaterial is missing from the tsl entry',`,
      `].filter((result) => result !== true);`,
      `if (problems.length > 0) { console.error(problems.join('; ')); process.exit(1); }`,
    ].join('\n'),
  },
  {
    name: `require('${pkg.name}') and require('${pkg.name}/tsl') load in Node through require(esm)`,
    file: 'probe.cjs',
    source: [
      `const TextGeometry = require('${pkg.name}');`,
      `const { MSDFTextNodeMaterial } = require('${pkg.name}/tsl');`,
      `const problems = [`,
      `  typeof TextGeometry.default === 'function' || 'the default export is not a class',`,
      `  typeof TextGeometry.BMFontJsonParser === 'function' || 'BMFontJsonParser is missing from the root entry',`,
      `  TextGeometry.TextAlign?.Left === 0 || 'TextAlign is missing from the root entry',`,
      `  typeof MSDFTextNodeMaterial === 'function' || 'MSDFTextNodeMaterial is missing from the tsl entry',`,
      `].filter((result) => result !== true);`,
      `if (problems.length > 0) { console.error(problems.join('; ')); process.exit(1); }`,
    ].join('\n'),
  },
]

let failed = 0
try {
  for (const dir of ['dist-esm']) {
    const extensionless = extensionlessSpecifiers(dir)
    if (extensionless.length > 0) {
      failed++
      console.error(`FAIL  every relative specifier in ${dir} carries a file extension`)
      for (const [file, specifier] of extensionless) console.error(`      - ${file} imports ${specifier}`)
    } else {
      console.log(`ok    every relative specifier in ${dir} carries a file extension`)
    }
  }

  for (const probe of probes) {
    const entry = path.join(consumer, probe.file)
    fs.writeFileSync(entry, `${probe.source}\n`)
    try {
      execFileSync(process.execPath, [entry], { cwd: consumer, stdio: 'pipe' })
      console.log(`ok    ${probe.name}`)
    } catch (error) {
      failed++
      console.error(`FAIL  ${probe.name}`)
      for (const line of `${error.stderr ?? error}`.trim().split('\n').slice(0, 12)) console.error(`      ${line}`)
    }
  }
} finally {
  fs.rmSync(consumer, { recursive: true, force: true })
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed. If src changed, rebuild and commit dist-esm: npm publishes it as committed.`)
  process.exit(1)
}
