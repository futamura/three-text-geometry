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
 * Usage: node scripts/verify-tree-shaking.mjs [packageDir]
 *
 *   packageDir  Optional. Check this unpacked package instead of the repo, e.g.
 *               a published tarball, to confirm this check still detects a leak.
 */

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
} finally {
  fs.rmSync(consumer, { recursive: true, force: true })
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed. If src changed, rebuild and commit dist-cjs / dist-esm: npm publishes them as committed.`)
  process.exit(1)
}
