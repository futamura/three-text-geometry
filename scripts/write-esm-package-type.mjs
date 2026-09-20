#!/usr/bin/env node
/**
 * Writes `dist-esm/package.json` with `{ "type": "module" }` after the ESM build.
 *
 * The root manifest has no `type`, so it is `commonjs` and every file under
 * dist-esm is a CommonJS file as far as Node is concerned. Node still loads
 * them - it reparses a file that fails to parse as CommonJS - but it warns
 * MODULE_TYPELESS_PACKAGE_JSON once per file and pays for the second parse.
 *
 * A nested manifest marks that subtree alone as ESM, which leaves dist-cjs and
 * the package's own `type` untouched. Putting `"type": "module"` in the root
 * manifest would flip dist-cjs to ESM as well, and that is a breaking change.
 *
 * `clean-dist` removes the directory, so this runs as part of every build
 * rather than being committed on its own.
 *
 * Usage: node scripts/write-esm-package-type.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const target = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist-esm', 'package.json')
fs.writeFileSync(target, `${JSON.stringify({ type: 'module' }, null, 2)}\n`)
