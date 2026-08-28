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
pnpm test-e2e         # Run E2E tests (requires Playwright)
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

**Shaders** (`src/shaders/`): GLSL shader sources for basic, SDF, and MSDF rendering. `src/shader/MultiPageShaderMaterial.ts` provides the material class for multi-texture fonts.

**React integration:** `src/helpers/fiber.ts` extends R3F for `<textGeometry>` JSX usage. `src/helpers/hook.ts` provides React hooks.

**Utilities** (`src/utils/`): `vertices.ts` (position/UV extraction), `quad-indices.ts` (index buffer generation), `compute.ts` (bounding box/sphere), `binary.ts` (binary data parsing).

## Build Output

Dual format: CommonJS (`dist-cjs/`, ES2018) and ESM (`dist-esm/`, ES2020). Both configured via separate tsconfig files (`tsconfig.cjs.json`, `tsconfig.esm.json`). Path aliases (`@three-text-geometry/*` → `./src/*`) are transformed at build time via `typescript-transform-paths`.

## Code Style

- Prettier: 300 char print width, single quotes, trailing commas, 2-space indent
- ESLint: strict unused variable warnings (underscore prefix ignored), JSDoc required on public APIs (classes, functions, methods, interfaces, type aliases)
- Commit messages: Conventional Commits format, enforced by commitlint via Husky pre-commit hook
- Import sorting handled by prettier-plugin-sort-imports

## Testing

- Jest 30 with ts-jest, jsdom environment
- Tests in `tests/*.spec.ts`, test fonts in `tests/fonts/`
- WebGL mocked via `tests/helpers/webgl-mock.ts` (no real GPU needed)
- CI runs tests with xvfb-run on Ubuntu (libgl1-mesa-dev for headless GL)

## Dependencies

- `three`, `react`, `@react-three/fiber` are **peerDependencies** (users must install them alongside this package)
- They are also in `devDependencies` for development/testing
- Core dependencies (`ajv`, `fast-xml-parser`, `swr`) remain in `dependencies`

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
