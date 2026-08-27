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
- Feature branches merge into develop

### Branch Protection

- **No direct push to `main` or `develop`** — all changes must go through pull requests
- Flow: feature branch → PR → `develop` → PR → `main`
- Exception: the post-release back-merge of `main` into `develop` is pushed directly (see
  [Back-merge After Release](#back-merge-after-release-required))

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

- `lint-check` and `test-coverage` must pass before PR merge

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
- The repository default `GITHUB_TOKEN` permission is `read`, and workflows may not
  approve pull requests. Every workflow declares its own `permissions:` block; a new one
  must do the same rather than relying on the default.
- A `develop → main` PR is automatically created when develop receives changes
- Merging the `develop → main` PR (and thus npm release) is done manually
