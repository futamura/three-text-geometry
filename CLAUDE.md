# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A pure TypeScript port of JavaScript BMFont rendering libraries for Three.js. Renders bitmap fonts with word-wrapping, text alignment, kerning, and letter spacing. Supports JSON, XML, ASCII, and Binary font formats. Provides React Three Fiber integration.

## Commands

```bash
pnpm install          # Install dependencies (pnpm 9.15.0+, Node 22+)
pnpm build            # Full build (CJS + ESM + minification)
pnpm dev              # Watch mode for both CJS and ESM
pnpm test             # Run all tests
pnpm test-coverage    # Run tests with coverage
pnpm lint-check       # ESLint check (max-warnings 0)
pnpm lint-fix         # ESLint auto-fix
pnpm format-check     # Prettier check
pnpm format-fix       # Prettier format
pnpm all              # format + lint + typedoc + build + test-coverage
```

Run a single test file: `pnpm jest tests/parser.spec.ts`

## Architecture

**Core class:** `src/TextGeometry.ts` — extends `THREE.BufferGeometry`. Takes a text string and `TextGeometryOption`, manages position/uv/page buffer attributes. Use `update(text?, option?)` to regenerate geometry.

**Layout engine:** `src/layout/TextLayout.ts` — calculates glyph positions with word wrapping, kerning, letter spacing, and alignment (left/center/right). `src/layout/WordWrap.ts` handles three wrap modes: Normal, Pre, NoWrap.

**Font parsers** (`src/parser/`): Four parsers implementing `IBMFontParser<T>` — `BMFontJsonParser` (with AJV schema validation), `BMFontXMLParser`, `BMFontAsciiParser`, `BMFontBinaryParser`. All parse into the common `BMFont` type defined in `src/types/BMFont.ts`.

**Materials** (`src/materials/`): TSL node materials — `BasicTextNodeMaterial`, `SDFTextNodeMaterial`, `MSDFTextNodeMaterial`, `MultiPageTextNodeMaterial`. Exported only from the `three-text-geometry/tsl` subpath (`src/tsl.ts`); see [Entry points and `sideEffects`](#entry-points-and-sideeffects). The GLSL shaders were removed in 4.0.0.

**React integration:** `src/helpers/fiber.ts` extends R3F for `<textGeometry>` JSX usage. `src/helpers/hook.ts` provides React hooks.

**Loading** (`src/helpers/loader.ts`): `download` (`fetch` plus progress), `parseFont` (picks the parser from the URL extension) and `loadTexture` (object URL through `TextureLoader`), used by the `useFont` hook. It is internal — not exported from either entry point. It uses `fetch`, `DataView`/`TextDecoder` and `URL.createObjectURL` on purpose: 5.0.1 removed the `axios` and `tslib` imports rather than declaring them, so the package's only runtime `dependencies` are `ajv`, `fast-xml-parser` and `swr`.

**Utilities** (`src/utils/`): `vertices.ts` (position/UV extraction), `quad-indices.ts` (index buffer generation), `compute.ts` (bounding box/sphere), `binary.ts` (binary data parsing).

### How the option is resolved, and the four bugs that came from getting it wrong

`TextGeometry` normalizes options in two different ways on purpose, and 5.0.6–5.0.9 were all one
class of mistake in this area. Read this before touching `update()`, `applyOption()` or either
setter.

- The constructor and the `option` setter **normalize fully**: every field the caller omits is
  filled with its default. They share `private applyOption(option, caller)`, which is also the only
  place `_opt.font` is written and the only place a missing font is rejected.
- `update(text?, option?)` **merges partially**: a field the caller omits keeps the value the
  geometry already has. Do not "unify" these — a partial `update()` is the point of the method, and
  making the setter partial is what #187 was.
- Fields **derived from another field** are the exception to the merge, because a stale derived
  value is invisible until it renders wrong. `end` comes from the text, so any call that changes the
  text re-derives it (#186); `lineHeight` comes from the font, so a call that changes the font
  re-derives it unless it passes a `lineHeight` of its own (#194). `update()` with neither argument
  touches no option at all — the constructor, `copy()` and the `option` setter depend on that.
- A new option field that defaults from another one needs the same treatment. The failure mode is
  always the same shape: the default is computed once, written into `_opt`, and then read back as
  its own fallback on the next `update()`.
- `TextLayout.update()` has its own rule — with an option it re-applies the literal defaults, which
  is why it never had #187 or #194 but did have #186 through its `text` setter. The two classes
  agree on behaviour now, not on implementation.
- `copy()` assigns `_text`/`_opt` and calls `update()` once. It went through the two setters before
  5.0.6, which spread the source string into an index object and left the target empty (#185).

`tests/textgeometry.spec.ts` pins each of these; `update keeps the fields the option omits` and
`update takes every field the option carries` exist to keep the partial path covered, since nothing
else calls `update()` with a full option any more.

## Build Output

Dual format: CommonJS (`dist-cjs/`, ES2018) and ESM (`dist-esm/`, ES2020). Both configured via separate tsconfig files (`tsconfig.cjs.json`, `tsconfig.esm.json`), and both compile with plain `tsc` — there are no transformer plugins.

### dist is committed, and it is what npm publishes

The release job runs `pnpm semantic-release` without building, so the tarball contains `dist-cjs/` and `dist-esm/` exactly as committed. Any `src/` change that should ship must include the rebuilt dist in the same PR (`pnpm build`; the output is deterministic, so unrelated files do not churn).

### Entry points and `sideEffects`

- `.` (`src/index.ts`) must not reach `src/materials/`. The TSL node materials import `three/webgpu` and `three/tsl`, and re-exporting them from the root put the WebGPU renderer (~87 KB gzip) in every consumer's bundle in 4.x. They live on the `./tsl` subpath (`src/tsl.ts`) since 5.0.0.
- `sideEffects` lists `dist-*/index.js` as well as `dist-*/helpers/fiber.js`. `import 'three-text-geometry'` exists to run `extend({ TextGeometry })`; if the index is marked side-effect free, a bundler drops that bare import before it ever reaches fiber.
- `pnpm verify-tree-shaking` bundles both cases from the committed dist with esbuild and runs in the `tests` job of both workflows. `node scripts/verify-tree-shaking.mjs <unpacked-tarball>` checks a published version; against 4.2.0 it fails, which is how to confirm the check still detects a leak.
- The same script also checks that every package the dist imports is in `dependencies` or `peerDependencies`. The bundling scenarios cannot catch that, because they externalize every other package — an undeclared import resolves against the repo's own `node_modules` and only breaks in a consumer's install, which is how `axios` shipped in 4.x. Against the 4.2.0 tarball it names both `axios` and the `tslib` that `importHelpers` used to inline.

The `@three-text-geometry/*` → `./src/*` aliases in `compilerOptions.paths` are used by `tests/` only; `src/` imports relatively, so the build has nothing to rewrite. Jest resolves the aliases through `pathsToModuleNameMapper` in `jest.config.ts`, which reads that same `paths` block — keep it even though the build does not need it.

## Code Style

- Prettier: 300 char print width, single quotes, trailing commas, 2-space indent
- ESLint: strict unused variable warnings (underscore prefix ignored), JSDoc required on public APIs (classes, functions, methods, interfaces, type aliases)
- Commit messages: Conventional Commits format, enforced by commitlint from the Husky `commit-msg` hook (`.husky/commit-msg`)
- Import sorting handled by prettier-plugin-sort-imports

## Testing

- Jest 30 with ts-jest. `jest.config.ts` sets `testEnvironment: 'node'`; the specs that need a DOM opt in with a `@jest-environment jsdom` docblock
- Tests in `tests/*.spec.ts`, test fonts in `tests/fonts/`
- WebGL mocked via `tests/helpers/webgl-mock.ts`, WebGPU via `tests/helpers/webgpu-mock.ts` (no real GPU needed)
- CI runs tests with xvfb-run on Ubuntu (libgl1-mesa-dev for headless GL)
- `tsconfig.json` sets no `lib` or `target`, so newer library methods (`Array.prototype.at`, for one) do not typecheck in tests, and `fs.readFileSync` yields a `Uint8Array<ArrayBufferLike>` that is not assignable to `BlobPart`
- ESLint's `jsdoc/require-*` rules apply to `tests/` as well, including local helper functions
- `e2e/` is Playwright's, not Jest's — `testPathIgnorePatterns` keeps `e2e/*.spec.ts` out of `pnpm test`. See [Smoke-testing the demo](#smoke-testing-the-demo)

### The branches that are left, and why they stay

Every file reaches 100% lines. The handful of uncovered *branches* are unreachable from the public
API, not gaps — reaching them would mean testing a state the code cannot be in. Confirmed by
reading the call graph, not by assumption:

- `BMFontAsciiParser.ts` `if (lines.length === 0)` — `String.prototype.split` always returns at
  least one element, so the empty input gives `['']`
- `TextLayout.ts` getters, `this._x ?? 0` — `update()` assigns all nine fields before anything else
  and the constructor always calls it, so none of them is ever undefined
- `TextLayout.ts` `if (!space) return` and `getGlyphById`'s `if (!font.chars || …)` — both sit
  behind the identical guard in `_setupSpaceGlyphs`, which returns first for a font with no chars

Leave them. Deleting them would touch `src/` and the committed dist to make a number rounder.

### What jsdom does not provide

`fetch`, `Response`, `ReadableStream`, `TextDecoder` and `URL.createObjectURL` are all missing (`Headers`, `Blob` and `URL` are there). So `loader.spec.ts` — which mocks `globalThis.fetch` and exercises the real `src/helpers/loader.ts` — has to stay in the node environment, and that style cannot be reused in a jsdom spec without polyfills.

`hook.spec.ts` therefore mocks `@three-text-geometry/helpers/loader` (Jest resolves the alias to the same module the hook reaches through `./loader`) and tests what is otherwise untested: the SWR keys, the progress aggregation across both items, and error surfacing. Wrap `renderHook` in `SWRConfig` with `provider: () => new Map()`, because SWR's cache is module state and leaks between tests.

### Testing the R3F registration

`fiber.spec.ts` renders `<textGeometry>` with `@react-three/test-renderer`, which needs no GPU in jsdom. Four things to know:

- Do **not** import `tests/helpers/webgl-mock` there. It replaces `THREE.WebGLRenderer` wholesale and fights the test renderer, which brings its own canvas and context
- Set `globalThis.IS_REACT_ACT_ENVIRONMENT = true`, or every render logs `The current testing environment is not configured to support act(...)`
- The geometry is **not** `findByType('TextGeometry')` — the test tree names it `bufferGeometry`. Assert through `renderer.scene.children[0].instance.geometry`
- The R3F catalog is module state, so a test for the unregistered case (it rejects with `R3F: TextGeometry is not part of the THREE namespace!`) must run before anything in that file imports `helpers/fiber`

`react-dom` is held at 19.2.8: `@react-three/fiber@9.7.0` declares `react-dom >=19 <19.3`, so 19.3.0 makes `pnpm install` report an unmet peer. Keep `@types/react-dom` on 19.2.x to match `@types/react`.

### Checking a change in the demo

`demo/` depends on the library through `file:..`, which pnpm **copies** at install time rather than linking. After rebuilding the dist, run `pnpm install --force` in `demo/` and start Vite with `--force`, or the demo keeps running the previous build.

### Smoke-testing the demo

`e2e/` holds the only tests that look at a rendered pixel — `demo.spec.ts` for the five routes and
`formats.spec.ts` for the four font formats. `pnpm e2e-install` once, then
`pnpm e2e`; it needs the library built and `demo/` reinstalled and built first, for the `file:..`
reason above. The `demo-smoke` job does exactly that, and it is part of `tests-result`, so it
blocks a merge through the check branch protection already names.

It opens all five routes twice each: once with the fonts withheld, which leaves only the axes
helper on the canvas, and once with them served, polling until the lit share of the canvas beats
that floor by 2x. The floor is measured per run rather than hardcoded because `OrbitControls
autoRotate` keeps the camera moving. Three things to know:

- **Hide the overlays before measuring.** An element screenshot captures what is composited *over*
  the canvas, and `stats.js` and the demo's MUI nav are white. They were 3.44% of the frame against
  a 4.55% floor — most of what the floor was measuring. `openScene` hides everything but the canvas,
  which puts the floor at 0.89%.
- **The four WebGPU flags go together.** `DemoPage` builds a `THREE.WebGPURenderer`, and the run
  exercises it rather than a fallback. `--enable-unsafe-webgpu` on its own is worse than useless: it
  hands out an adapter whose canvas reads back fully transparent, and the demo then reports `WebGPU
  Device Lost` on every route. Adding `--enable-features=Vulkan --use-vulkan=swiftshader
  --use-angle=swiftshader` makes it work. With no flags at all `WebGPURenderer` falls back to WebGL,
  which renders the ordinary scenes but not `/shader` and `/shuffleshader` — their material comes
  from `wgslFn`, and raw WGSL cannot compile there.
- **Fonts come from `tests/fonts` through `page.route`,** not from the `raw.githubusercontent.com`
  URLs the scenes carry, so the run is offline and tests the checkout. `fulfill`, not `continue` —
  Playwright refuses to redirect a request to another protocol.

If it ever flakes, lower the multiplier rather than adding a sleep; each poll already waits 60s,
inside a 180s per-test timeout. Both were raised in #215 after three of forty route-tests went past
17s on a loaded machine; the waits poll, so a healthy run costs the same.
`/multipage` is the route to watch, since its text covers the least canvas: measured over three runs
each, the floor is 0.89% everywhere and the worst frame with text is 3.56% there, against 4.68% to
6.17% on the other four.

### The four font formats in a browser

`demo.spec.ts` covers the scenes as the demo ships them, and those load JSON and ASCII only, so XML
and binary reached a real browser through nothing — the gap #202 fell through. `formats.spec.ts`
closes it by rendering one case per format through `/simple`, which takes the font and the atlas as
query parameters; `helpers.ts` holds the interception, the ink measurement and `openScene`, shared
by both specs.

- **The query names a file under `tests/fonts`, not a URL.** `SimpleScene` joins it onto the fixed
  `raw.githubusercontent.com` base, so the demo cannot be pointed at another host and `page.route`
  still intercepts. With no query the scene behaves exactly as before.
- **Assert which font was requested.** `routeFonts` returns the names the page asked for, and each
  case checks its own file is among them. Without that a scene that ignored the query would render
  its default and pass every case — which is why the ASCII case uses `UnitedSansRgBd-48.fnt` rather
  than the `Lato-Regular-64.fnt` the scene defaults to.
- **Binary renders untextured.** `Arial.bin` names `font-bin_0.tga`, which is not in the repository
  and which `TextureLoader` could not read. Omitting `?texture=` leaves the material without a map,
  so the quads paint solid — enough to show the layout happened, and the binary path's own risk is
  `fetch` → `ArrayBuffer` → `DataView`/`TextDecoder`, not the atlas. Cross-format agreement of the
  parsed values stays in `tests/parser.spec.ts`.
- **A font query pins the longest passage.** `useTextData` otherwise picks at random, and the five
  passages differ in length by 2x, which moved the binary case between 2.48% and 3.59%. Pinned, the
  ink readings repeat to two decimals run over run: 19.4% json, 19.3% xml, 6.9% ascii, 3.6% binary
  against the same 0.90% floor. Binary is the tightest of the nine tests at ~3.9x, next to
  `/multipage`.

## Dependencies

- `three`, `react`, `@react-three/fiber` are **peerDependencies** (users must install them alongside this package)
- They are also in `devDependencies` for development/testing
- Core dependencies (`ajv`, `fast-xml-parser`, `swr`) remain in `dependencies`

### commitlint is pinned to 20 on purpose

`@commitlint/config-conventional` moved its preset dependency from
`conventional-changelog-conventionalcommits@^9` to `^10` in its 21 major.
`@semantic-release/release-notes-generator` does **not** declare that preset — it
resolves it by name at run time, and in a pnpm tree the fallback hoist directory
answers the lookup. It does declare `conventional-changelog-writer@^8`, and preset
10 refuses to render with writer 8.

So bumping commitlint to 21 silently swaps the preset semantic-release loads and
the release dies in `generateNotes` — on `main`, after the merge. That is what
happened to 4.1.2 (fixed in #151). `release-notes-generator@14.1.1` is the latest,
and no release of it accepts preset 10 yet.

Do not raise `@commitlint/cli` or `@commitlint/config-conventional` past 20 until
`release-notes-generator` ships support for preset 10. Pinning the preset through
`pnpm.overrides` also works, but forces config-conventional outside its declared
range, and the preset supplies commitlint's parser options too.

`pnpm verify-release-notes` guards this. It renders sample commits through the
preset semantic-release will actually load and the writer it depends on, and runs
in the `tests` job of both workflows. `semantic-release --dry-run` does **not**
cover it: on a non-release branch the run stops at the branch check, before
`generateNotes`.

## Branch Strategy & Development Workflow

### Branches

- `main` — production releases (semantic-release auto-publishes to npm)
- `develop` — development branch
- `beta` — dormant pre-release branch, kept on purpose (see [Pre-release Channels](#pre-release-channels))
- Feature branches merge into develop

### Pre-release Channels

`.releaserc.mjs` registers three pre-release channels alongside `main`:

```js
{ name: "alpha", prerelease: true },
{ name: "beta", prerelease: true },
{ name: "rc", prerelease: true },
```

Only `beta` exists as a branch; `alpha` and `rc` never have. semantic-release skips a configured
branch that has no ref, which is why their absence has never broken a release.

**Do not delete `beta` as branch cleanup.** It reads as a leftover — its tip is `566b0fd`
(2025-06-23), it holds zero commits `main` lacks, and it sits 177 commits behind — but it is the
entry point for the `beta` channel, and the only registered channel that still has one. Removing it
is a release-configuration decision, not housekeeping: drop the `.releaserc.mjs` entry in the same
change, or leave both in place.

To cut a pre-release, branch `beta` off `main`, push the commits there, and semantic-release
publishes `x.y.z-beta.n` under the npm `beta` dist-tag.

That dist-tag is currently stale: it points at `0.0.1-beta.5` (tags `0.0.1-beta.1` through `.5`), so
`npm install three-text-geometry@beta` resolves to a 0.0.1 pre-release rather than anything near
`latest` (4.1.1). The next `beta` release moves it.

### Branch Protection

- **No direct push to `main` or `develop`** — all changes must go through pull requests
- Flow: feature branch → PR → `develop` → PR → `main`
- Exception: the post-release back-merge of `main` into `develop` is pushed directly (see
  [Back-merge After Release](#back-merge-after-release-required))

Both branches use classic branch protection:

| Setting | `main` | `develop` |
| --- | --- | --- |
| Pull request required | yes (0 approvals) | yes (0 approvals) |
| Required status check | `tests-result` | `tests-result` |
| Require branches up to date (`strict`) | yes | no |
| Force push / branch deletion | blocked | blocked |
| `enforce_admins` | off | off |

`enforce_admins` is off on both branches, so the repo owner can still push directly. That is what
lets the back-merge below — and semantic-release's `chore(release)` push — succeed. The "no direct
push" rule above is therefore policy, not something the protection enforces for the owner.

`strict` is deliberately off on `develop`: with it on, merging any PR into `develop` would make
every other open PR out of date and force an update plus a full CI re-run.

### Merge Strategy

- **feature → develop**: Squash merge (consolidate PR commits into one)
- **develop → main**: Merge commit (preserve commit history for semantic-release analysis)
- **main → develop**: Merge commit (back-merge, required after every release — see below)

### Back-merge After Release (required)

`main` has "Require branches to be up to date before merging" enabled, and every release adds
commits that only exist on `main`:

- the `develop → main` merge commit
- the `chore(release): x.y.z [skip ci]` commit pushed by semantic-release

`develop` never receives these on its own, so the *next* `develop → main` PR is blocked with
`the head branch is not up to date with the base branch`.

After each release, back-merge `main` into `develop`:

```sh
git checkout develop
git merge origin/main --no-edit
git push origin develop
```

Equivalent alternatives: the **Update branch** button on the `develop → main` PR, or merging with
`--admin` to bypass the check (leaves `develop` behind and defers the problem).

### CI Requirements

- `tests-result` is the required status check on both `main` and `develop`. It aggregates the
  `tests` matrix (Node 22.x / 24.x), which runs `pnpm lint-check` and `pnpm test-coverage`.

### Versioning (Conventional Commits)

- `feat!:` or `BREAKING CHANGE:` → **major** version bump
- `feat:` → **minor** version bump
- `fix:` → **patch** version bump

### Peer Dependencies Update Policy

- **Major version** update of peerDeps (three.js, react, @react-three/fiber) → `feat!:` (breaking change, major bump)
- **Minor/patch version** update of peerDeps → `feat:` (minor bump)
- Raising a peerDeps **floor** is itself breaking, so do it deliberately — never as a
  side effect of tracking the newest release
- The `update-three` workflow follows this: it bumps `devDependencies` and
  `demo/package.json` only, leaves `peerDependencies.three` (and the version quoted in
  `README.md`) alone, and picks `feat!:` over `feat:` only when three.js changes its
  leading version component

### Release Process

- semantic-release runs automatically on merge to `main`
- Automatically creates npm publish and GitHub Release

### Automation

- Dependabot **alerts** are on, but Dependabot does not open PRs here: there is no
  `.github/dependabot.yml` (so no version updates) and automated security fix PRs are
  disabled. The version-update config and the auto-merge workflow were removed in #111.
- Advisories are therefore resolved by hand. For a transitive dependency, pin it through
  `pnpm.overrides` rather than chasing the direct dependency that pulls it in.
- The repository default `GITHUB_TOKEN` permission is `read`. Every workflow declares its
  own `permissions:` block; a new one must do the same rather than relying on the default.
- Scope that block to what `GITHUB_TOKEN` itself does, not to what the workflow does. A
  workflow that opens its PR with `RELEASE_TOKEN` needs no `pull-requests` permission at
  all, and `update-three.yaml` declares permissions per job because only `update-and-test`
  pushes a branch — `check-update` merely reads the repo and files an issue.
- **Allow GitHub Actions to create and approve pull requests** is **off**. Despite the name
  it also gates PR *creation*, so `sync-develop-to-main.yaml` and `update-three.yaml` open
  their PRs with the `RELEASE_TOKEN` PAT instead of `GITHUB_TOKEN`. A new workflow that
  opens a PR must do the same, or it fails with
  `GitHub Actions is not permitted to create or approve pull requests (createPullRequest)`.
- The PAT has a second effect `update-three.yaml` depends on: a PR opened with
  `GITHUB_TOKEN` does not fire the `pull_request` event, so `deps/update-three-*` would
  never get the `tests-result` check that `develop` requires.
- `RELEASE_TOKEN` is therefore load-bearing for releases *and* for automated PRs. If it
  expires, both stop.
- A `develop → main` PR is automatically created when develop receives changes. The
  workflow exits early when develop is not ahead of main, which is what the post-release
  back-merge push leaves behind.
- Merging the `develop → main` PR (and thus npm release) is done manually
