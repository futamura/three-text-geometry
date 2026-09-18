#!/usr/bin/env node
/**
 * Guards what a bundler pulls in from the published entry points.
 *
 * The TSL node materials import three/webgpu and three/tsl. In 4.x they were
 * re-exported from the root entry, so an app that only used TextGeometry, the
 * parsers or the R3F helper still shipped the WebGPU renderer (about 87 KB
 * gzip in a Next.js build). 5.0.0 moved them to the `three-text-geometry/tsl`
 * subpath and declared `sideEffects`.
 *
 * `sideEffects` cuts both ways: the bare `import 'three-text-geometry'` exists
 * to run `extend({ TextGeometry })` in helpers/fiber, and a bundler drops that
 * import outright if the entry it reaches is marked side-effect free.
 *
 * This bundles each scenario from the committed dist - which is what npm
 * publishes, since the release job does not build - through the package's own
 * `exports` and `sideEffects`, and checks the output.
 *
 * It also checks that every package the dist imports is declared. Bundling
 * cannot catch that on its own: every other package is externalized here, so an
 * undeclared import resolves fine and only breaks in a consumer's install. That
 * is how 5.0.1's `axios` import reached npm.
 *
 * Usage: node scripts/verify-tree-shaking.mjs [packageDir]
 *
 *   packageDir  Optional. Check this unpacked package instead of the repo, e.g.
 *               a published tarball, to confirm this check still detects a leak.
 */

import { builtinModules } from 'node:module'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = path.resolve(process.argv[2] ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..'))
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))

/* Resolve the package by name, the way a consumer does, by linking it into a scratch node_modules. */
const consumer = fs.mkdtempSync(path.join(os.tmpdir(), 'ttg-tree-shaking-'))
fs.mkdirSync(path.join(consumer, 'node_modules'))
fs.symlinkSync(root, path.join(consumer, 'node_modules', pkg.name), 'dir')

/* Keep every other package external, so its import statements survive in the output where they can be checked. */
const externalizeOthers = {
  name: 'externalize-others',
  setup(b) {
    b.onResolve({ filter: /^[^./]/ }, (args) => (args.path === pkg.name || args.path.startsWith(`${pkg.name}/`) ? undefined : { path: args.path, external: true }))
  },
}
const WEBGPU = /from\s*["']three\/(webgpu|tsl)["']/
const FIBER_EXTEND = /import\s*\{[^}]*\bextend\b[^}]*\}\s*from\s*["']@react-three\/fiber["']/

const scenarios = [
  {
    name: 'bare side-effect import keeps the R3F registration and skips WebGPU',
    source: `import '${pkg.name}';`,
    expect: (out) => [FIBER_EXTEND.test(out) || 'extend() from @react-three/fiber was dropped', !WEBGPU.test(out) || 'three/webgpu or three/tsl is bundled'],
  },
  {
    name: 'root named imports skip WebGPU',
    source: `import TextGeometry, { BMFontAsciiParser, BMFontBinaryParser, BMFontJsonParser, BMFontXMLParser, TextAlign } from '${pkg.name}';\nconsole.log(TextGeometry, BMFontAsciiParser, BMFontBinaryParser, BMFontJsonParser, BMFontXMLParser, TextAlign);`,
    expect: (out) => [!WEBGPU.test(out) || 'three/webgpu or three/tsl is bundled'],
  },
  {
    /* Proves the WebGPU pattern still matches real output, so the checks above cannot pass vacuously. */
    name: 'tsl subpath brings WebGPU in',
    source: `import { MSDFTextNodeMaterial } from '${pkg.name}/tsl';\nconsole.log(MSDFTextNodeMaterial);`,
    expect: (out) => [WEBGPU.test(out) || 'three/webgpu or three/tsl is missing from the tsl entry'],
  },
]

/* `require("x")`, `import("x")` and `from"x"`, as uglify leaves them - no space, either quote. */
const SPECIFIER = /(?:require|import)\s*\(\s*["']([^"']+)["']\s*\)|(?:from|import)\s*["']([^"']+)["']/g

/**
 * The packages every .js file under the published dist directories imports, each with the first file that imports it.
 *
 * @returns {Map<string, string>} Package name to the repo-relative file importing it.
 */
function importedPackages() {
  const found = new Map()
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
        continue
      }
      if (!entry.name.endsWith('.js')) continue
      for (const match of fs.readFileSync(full, 'utf8').matchAll(SPECIFIER)) {
        const specifier = match[1] ?? match[2]
        /* Relative and absolute specifiers resolve inside the package itself. */
        if (specifier.startsWith('.') || specifier.startsWith('/')) continue
        /* A subpath such as three/webgpu is served by the package it belongs to. */
        const segments = specifier.split('/')
        const name = specifier.startsWith('@') ? segments.slice(0, 2).join('/') : segments[0]
        if (!found.has(name)) found.set(name, path.relative(root, full))
      }
    }
  }
  for (const dir of (pkg.files ?? []).map((entry) => path.join(root, entry))) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) walk(dir)
  }
  return found
}

/**
 * The imported packages that the manifest does not declare.
 *
 * @returns {Array<[string, string]>} Undeclared package names with the file importing each.
 */
function undeclaredImports() {
  const declared = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {}), ...builtinModules, ...builtinModules.map((name) => `node:${name}`)])
  return [...importedPackages()].filter(([name]) => !declared.has(name))
}

let failed = 0
try {
  for (const scenario of scenarios) {
    let problems
    try {
      const result = await build({
        stdin: { contents: scenario.source, resolveDir: consumer, sourcefile: 'entry.js' },
        bundle: true,
        write: false,
        format: 'esm',
        platform: 'browser',
        plugins: [externalizeOthers],
        logLevel: 'silent',
      })
      problems = scenario.expect(result.outputFiles[0].text).filter((r) => r !== true)
    } catch (error) {
      problems = [error.errors?.map((e) => e.text).join('; ') ?? String(error)]
    }
    if (problems.length === 0) {
      console.log(`ok    ${scenario.name}`)
    } else {
      failed++
      console.error(`FAIL  ${scenario.name}`)
      for (const problem of problems) console.error(`      - ${problem}`)
    }
  }

  /* CommonJS has no tree shaking at all, so the root CJS entry must not reference the materials either. */
  const cjsIndex = fs.readFileSync(path.join(root, 'dist-cjs', 'index.js'), 'utf8')
  if (/materials|TextNodeMaterial/.test(cjsIndex)) {
    failed++
    console.error('FAIL  dist-cjs/index.js references the TSL materials')
  } else {
    console.log('ok    dist-cjs/index.js does not reference the TSL materials')
  }

  /* An import the package does not declare resolves in this repo and breaks in a consumer's install. */
  const undeclared = undeclaredImports()
  if (undeclared.length > 0) {
    failed++
    console.error('FAIL  every package the dist imports is declared')
    for (const [name, file] of undeclared) console.error(`      - ${name} (imported by ${file}) is in neither dependencies nor peerDependencies`)
  } else {
    console.log('ok    every package the dist imports is declared')
  }
} finally {
  fs.rmSync(consumer, { recursive: true, force: true })
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed. If src changed, rebuild and commit dist-cjs / dist-esm: npm publishes them as committed.`)
  process.exit(1)
}
