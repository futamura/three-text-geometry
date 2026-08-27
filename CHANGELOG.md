## [4.1.0](https://github.com/futamura/three-text-geometry/compare/4.0.5...4.1.0) (2026-08-27)

### Features

* update three.js to 0.185.1 ([#133](https://github.com/futamura/three-text-geometry/issues/133)) ([80fa9d8](https://github.com/futamura/three-text-geometry/commit/80fa9d8ab672805151077c6d37dc3403550dcc0a))

## [4.0.5](https://github.com/futamura/three-text-geometry/compare/4.0.4...4.0.5) (2026-08-27)

### Bug Fixes

* **ci:** stop raising the three.js peerDeps floor on every update ([#131](https://github.com/futamura/three-text-geometry/issues/131)) ([052fd5f](https://github.com/futamura/three-text-geometry/commit/052fd5ffaec433d83abd4455f865ae20bb35c8d1)), closes [#130](https://github.com/futamura/three-text-geometry/issues/130)
* correct the case of dist-cjs/layout/WordWrap files ([#134](https://github.com/futamura/three-text-geometry/issues/134)) ([3de2ff1](https://github.com/futamura/three-text-geometry/commit/3de2ff1f5f8dc05b251229baee9c5168256d7019))

## [4.0.4](https://github.com/futamura/three-text-geometry/compare/4.0.3...4.0.4) (2026-08-27)

### Bug Fixes

* **ci:** stop pinning pnpm version in update-three workflow ([#128](https://github.com/futamura/three-text-geometry/issues/128)) ([851312a](https://github.com/futamura/three-text-geometry/commit/851312a9bb5a41ec1501acb84da2efe1f40160c8))

## [4.0.3](https://github.com/futamura/three-text-geometry/compare/4.0.2...4.0.3) (2026-08-27)

### Bug Fixes

* **ci:** set default GITHUB_TOKEN permissions to contents:read ([#126](https://github.com/futamura/three-text-geometry/issues/126)) ([1cfdfba](https://github.com/futamura/three-text-geometry/commit/1cfdfba5c6b38380ab6a95552e62507aae413c80)), closes [#10](https://github.com/futamura/three-text-geometry/issues/10) [#11](https://github.com/futamura/three-text-geometry/issues/11)

## [4.0.2](https://github.com/futamura/three-text-geometry/compare/4.0.1...4.0.2) (2026-08-27)

### Bug Fixes

* **deps:** patch js-yaml, fast-uri and react-router advisories ([#123](https://github.com/futamura/three-text-geometry/issues/123)) ([f0334f6](https://github.com/futamura/three-text-geometry/commit/f0334f6563448c5441964d9e8093d38da450fe6f))

## [4.0.1](https://github.com/futamura/three-text-geometry/compare/4.0.0...4.0.1) (2026-07-26)

### Bug Fixes

* **deps:** resolve Dependabot alerts across root and demo ([#120](https://github.com/futamura/three-text-geometry/issues/120)) ([5919be9](https://github.com/futamura/three-text-geometry/commit/5919be9587fe0b3f9ec8a34885aa37ae35781e2d)), closes [#378](https://github.com/futamura/three-text-geometry/issues/378)

## [4.0.0](https://github.com/futamura/three-text-geometry/compare/3.0.1...4.0.0) (2026-04-13)

### ⚠ BREAKING CHANGES

* add WebGPU/TSL support and upgrade dependencies

### Features

* add WebGPU/TSL support and upgrade dependencies ([b330b89](https://github.com/futamura/three-text-geometry/commit/b330b89704af46552b3651f3d8d9b907216858e0))

### Bug Fixes

* use conventionalcommits preset for semantic-release ([de86854](https://github.com/futamura/three-text-geometry/commit/de86854aab84f911971e40834e3def234e0ff33a))

## [3.0.1](https://github.com/futamura/three-text-geometry/compare/3.0.0...3.0.1) (2026-03-11)


### Bug Fixes

* auto-register TextGeometry with R3F catalog on import ([d528915](https://github.com/futamura/three-text-geometry/commit/d528915c450b8908d6f9eec2ca4c71483c90e654))

# [3.0.0](https://github.com/futamura/three-text-geometry/compare/2.0.3...3.0.0) (2026-03-10)


* feat!: migrate to React 19 and React Three Fiber v9 ([3544c41](https://github.com/futamura/three-text-geometry/commit/3544c417737d9f63f062e9162ccf9376cfc2fe72))


### Bug Fixes

* resolve JSDoc lint warnings in fiber.ts ([db9e4d9](https://github.com/futamura/three-text-geometry/commit/db9e4d9e688977432a89bb2206de035a9071fbf6))


### BREAKING CHANGES

* Minimum peer dependency versions
changed to react@19, @react-three/fiber@9,
three@0.172

Co-Authored-By: Claude Opus 4.6
<noreply@anthropic.com>

* feat(demo): rewrite demo app with React Three Fiber

- Replace vanilla Three.js class components with R3F
  functional components
- Add @react-three/fiber and @react-three/drei, remove
  axios from demo
- Convert 5 demos (Simple, Multipage, Shuffle, Shader,
  ShuffleShader) to R3F scenes
- Add shared SceneSetup, DemoPage, useTextData hooks
- Convert Navigation to functional component
- Restructure README: R3F as primary, Vanilla as concise
  secondary example

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>

## [2.0.3](https://github.com/futamura/three-text-geometry/compare/2.0.2...2.0.3) (2026-03-10)


### Bug Fixes

* **test:** replace HTTP fetch with local file reads in parser tests ([#59](https://github.com/futamura/three-text-geometry/issues/59)) ([a1f0931](https://github.com/futamura/three-text-geometry/commit/a1f0931c035436bcd381872701eeea4f44715701))

## [2.0.2](https://github.com/futamura/three-text-geometry/compare/2.0.1...2.0.2) (2026-03-10)


### Bug Fixes

* **ci:** use PAT for semantic-release to bypass branch protection ([ad83323](https://github.com/futamura/three-text-geometry/commit/ad8332320ff8f3ee731e681b43a10606c5e2df7e))
* **deps:** remove markdown-toc to resolve lodash.template vulnerability ([af70617](https://github.com/futamura/three-text-geometry/commit/af70617599bd41ac012383f71c320cc79d2ce726))

## [2.0.1](https://github.com/futamura/three-text-geometry/compare/2.0.0...2.0.1) (2026-03-09)


### Bug Fixes

* resolve security vulnerabilities in dependencies and code ([9aab3cd](https://github.com/futamura/three-text-geometry/commit/9aab3cd40fe7242369c2324569cd1b7e9d0b40ea))

# [2.0.0](https://github.com/futamura/three-text-geometry/compare/v1.0.1...2.0.0) (2026-03-09)


* feat!: upgrade three.js to 0.183.2 ([94575a9](https://github.com/futamura/three-text-geometry/commit/94575a90eeb4ff6e6643c0680512d4eaa2819320))


### Bug Fixes

* **ci:** restore NPM_TOKEN and add issues permission to main workflow ([2bf2164](https://github.com/futamura/three-text-geometry/commit/2bf216400d4c4bfed8d6b1ea203d84b449008789))
* correct repository.type from "https" to "git" and add publishConfig ([e39ab1e](https://github.com/futamura/three-text-geometry/commit/e39ab1ec706e8a647ec1502dca7d141e7081ee7f))


### BREAKING CHANGES

* minimum peer dependency for three.js raised from >=0.167.1 to >=0.172.0

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>

# [1.0.0](https://github.com/futamura/three-text-geometry/compare/0.2.0...1.0.0) (2026-03-09)


* feat!: migrate three, react, @react-three/fiber to peerDependencies ([6a3ba29](https://github.com/futamura/three-text-geometry/commit/6a3ba296ac8ae0cdf698a5bad6c793f2f33f6d9f))


### Bug Fixes

* correct formatting in TextGeometryJSXExample component ([906c94d](https://github.com/futamura/three-text-geometry/commit/906c94ddaad60c49aba287eb4eb73932cd7e8a0c))
* fix script ([3099462](https://github.com/futamura/three-text-geometry/commit/309946213963384bd0f0a42fde7bb75d4df7c1f1))
* fixed an issue that progress event for TextureLoader is not fired ([e806a7d](https://github.com/futamura/three-text-geometry/commit/e806a7d4f77c50549a0f06c09103f7c164bfb8ce))
* **hooks:** Handle undefined total in progress calculation ([d771cea](https://github.com/futamura/three-text-geometry/commit/d771cea0b0b7faf512f45902183cabef0505e212))
* Increase stdout maxBuffer to handle large diffs ([514c4ac](https://github.com/futamura/three-text-geometry/commit/514c4aca9ed99bbf143117c6ec9fa98269443f21))
* Increase stdout maxBuffer to handle large diffs ([f7965c1](https://github.com/futamura/three-text-geometry/commit/f7965c1274c92895ad0443bc767886d93aac6b79))
* rename unused parameter url to _url to satisfy ESLint no-unused-vars rule ([1574863](https://github.com/futamura/three-text-geometry/commit/1574863bdf1f3419c8aea62f376882fa8aa18393))
* update duration in TextMesh for smoother animation ([ee3b74c](https://github.com/futamura/three-text-geometry/commit/ee3b74c66377fab2aaaa799d5d4a525235d4d6a3))
* **utils/compute.ts:** refactor compute functions to use THREE.Box2 and THREE.Sphere, improve performance by avoiding unnecessary type checks. This modification fixes bug that a computingBoundingBox value sometimes returns  inconsist value. ([6217d2a](https://github.com/futamura/three-text-geometry/commit/6217d2a88ab25317af29dde121949d7d8093072a))


### Features

* add @react-three/postprocessing dependency for enhanced visual effects ([925f5f5](https://github.com/futamura/three-text-geometry/commit/925f5f57cd93122ed54b531365ba05463e93a53e))
* add DemoJSX component and integrate into routing ([774a338](https://github.com/futamura/three-text-geometry/commit/774a338ec14b997bf4dadca84625180228fab9d3))
* add DemoJSXShader component for advanced text rendering ([d682ce4](https://github.com/futamura/three-text-geometry/commit/d682ce4f44d6425b2237d930e6c94d132805f175))
* add DemoJSXShuffle component for enhanced text rendering ([3d5c05b](https://github.com/futamura/three-text-geometry/commit/3d5c05bbc74c1c5d390e860592431a364f7ae994))
* add DemoJSXShuffleShader component for advanced text effects ([46b7575](https://github.com/futamura/three-text-geometry/commit/46b75750d4ef3760b2ff4e952973cd20b1033d66))
* add dynamic text and traditional text geometry examples ([c569829](https://github.com/futamura/three-text-geometry/commit/c569829eaca6d28fa3041031b77dd94d78187dfb))
* add postprocessing dependency for enhanced visual effects ([c8d90e5](https://github.com/futamura/three-text-geometry/commit/c8d90e513e4dbd984e7c5e436d9a50a1144f7ba9))
* add progress callback for useFont hook ([27e2c71](https://github.com/futamura/three-text-geometry/commit/27e2c71d487fcad66958271ad64c225af04df57e))
* add support for @react-three/drei and @react-three/fiber in demo ([59572a6](https://github.com/futamura/three-text-geometry/commit/59572a6972659957347b6642d372301998eac384))
* add SWR dependency for data fetching ([ff5e942](https://github.com/futamura/three-text-geometry/commit/ff5e9427f9907190ebfcb4c8c463f4c056b66b89))
* add three-stdlib dependency for enhanced 3D capabilities ([bb3ecb3](https://github.com/futamura/three-text-geometry/commit/bb3ecb353e31a9383526dd1b51b72da53ad2d5d2))
* enhance DemoJSX component with improved camera controls and Gizmo integration ([a0f2822](https://github.com/futamura/three-text-geometry/commit/a0f28229f0394c69d26c874e0d82f99e0b51b443))
* enhance DemoJSX component with random text generation and minor adjustments ([0426a33](https://github.com/futamura/three-text-geometry/commit/0426a333e526bbfe8941689b0f0301cae9a7030d))
* Fixed `IntrinsicElements` for `@react-three/fiber` ([019cc75](https://github.com/futamura/three-text-geometry/commit/019cc7533d286fb9d387b41a347eada60cb3adf0))
* **helpers/fiber.ts:** Add TextGeometryNode to JSX IntrinsicElements and extend fiber namespace for TextGeometry ([babd61d](https://github.com/futamura/three-text-geometry/commit/babd61d4b9815db7db787d861350b5cfb54269ad))
* **helpers/fiber.ts:** Add TextGeometryProps type and extend JSX IntrinsicElements with TextGeometryElements interface for better type safety and readability ([ca6e915](https://github.com/futamura/three-text-geometry/commit/ca6e91582e27c8eb22cc3d12be1434b33203ae45))
* **helpers/hook.ts:** Add support for loading BMFont files in various formats (fnt, json, xml, bin) ([e52e933](https://github.com/futamura/three-text-geometry/commit/e52e933d016b2fa8cb5aa97f829d27d778e28ab9))
* **helpers/hook.ts:** Add support for loading BMFont files in various formats (fnt, json, xml, bin) ([e594687](https://github.com/futamura/three-text-geometry/commit/e5946872edad01f19d849363961898dfebbbda0b))
* **helpers/hook.ts:** Add support for loading BMFont files in various formats (fnt, json, xml, bin) ([98e3e32](https://github.com/futamura/three-text-geometry/commit/98e3e3212dd6aff6efd3643ae3b380d352b042ad))
* **helpers/hook:** add custom hook to load a font and its texture using SWR and Three.js ([f26265e](https://github.com/futamura/three-text-geometry/commit/f26265e7a8fb9ec16dd653b9a52525b09ba13020))
* **helpers/hook:** add custom hook to load a font and its texture using SWR and Three.js ([6470ac4](https://github.com/futamura/three-text-geometry/commit/6470ac4e5207549807f756662e5653575945c626))
* integrate Tailwind CSS into demo application ([b5da2c2](https://github.com/futamura/three-text-geometry/commit/b5da2c26c1d5a282d6ab69545786e05365a31450))
* introduce DemoJSXSimple component for enhanced text geometry rendering ([ff921b1](https://github.com/futamura/three-text-geometry/commit/ff921b1d71fdc64eccac066eadb0c5e23220dd10))
* refactor DemoJSX component to utilize SWR for font loading and improve structure ([d4ff455](https://github.com/futamura/three-text-geometry/commit/d4ff4553b8a21810e3641073bbd3839f7ff7bb6f))
* **src/helpers/fiber.ts:** add TextGeometryNode and TextGeometryProps types for the TextGeometry component using @react-three/fiber ([45b96ad](https://github.com/futamura/three-text-geometry/commit/45b96ad240f8a6f12cebd3bc9d6450882732b3e2))
* TextGeometry - Add copy method to clone geometry with text and options ([4eba7ca](https://github.com/futamura/three-text-geometry/commit/4eba7ca1437f2427b6fd188548db5899db6f1ab7))
* **TextGeometry:** Add a warning when no font is specified in options and allow updating the font option ([2a1932a](https://github.com/futamura/three-text-geometry/commit/2a1932a752b32387d22d5fe2c102e280623a4dad))
* upgrade canvas to v3.1.1 ([ec482d8](https://github.com/futamura/three-text-geometry/commit/ec482d876724ce33dce2525ca3e6710d4f87b9ef))
* use Promise for TextureLoader ([4496bb6](https://github.com/futamura/three-text-geometry/commit/4496bb69fe6039dbeb42430388b81fc999b2fdc0))


### Reverts

* **helpers/fiber.ts:** Add `TextGeometryOption` to the `TextGeometryNode` type for better type safety and consistency with other fiber nodes. ([c75b6a7](https://github.com/futamura/three-text-geometry/commit/c75b6a7e9755591f9a119e45da483a167b6f65de))


### BREAKING CHANGES

* three, react, and @react-three/fiber are now peer
dependencies. Users must install them alongside three-text-geometry.

Also adds a GitHub Actions workflow to auto-detect Three.js updates
and create PRs, and removes stale git tags 3.0.0 and 4.0.0.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>

# [0.2.0](https://github.com/futamura/three-text-geometry/compare/0.1.0...0.2.0) (2024-09-03)


### Features

* release 0.1.1 ([f4241bd](https://github.com/futamura/three-text-geometry/commit/f4241bd3c04ddc7c212f37802541e7c5918e47d8))

# [0.1.0](https://github.com/futamura/three-text-geometry/compare/0.0.0...0.1.0) (2024-09-03)


### Bug Fixes

* add clipCullDistance and multiDraw extensions to ShaderMaterialParameters class and fix build the error below: ([5c33c3b](https://github.com/futamura/three-text-geometry/commit/5c33c3be467f882b71f94b0d8fa7eaf3f9b63599))
* build source ([bcfa80c](https://github.com/futamura/three-text-geometry/commit/bcfa80cef3d21d69f6234f244ab78284410b6869))
* **DemoBase.tsx:** Prevent duplicate registration of event listeners and clean up on component unmount ([c22e2dd](https://github.com/futamura/three-text-geometry/commit/c22e2dd7ba775f3d1d846b6d4bdff109aa62e50e))
* **DemoBase:** Add didInitScene flag to prevent multiple initialization in componentDidMount ([c891a84](https://github.com/futamura/three-text-geometry/commit/c891a84ed9c6adaf2c2ed2fcbf5d37064e2abdc2))
* **DemoBase:** update animationFrameID to a number type and change fps limit to 120 for better performance and consistency ([cd6d306](https://github.com/futamura/three-text-geometry/commit/cd6d306518fb6ffae918f74bb3f25fc9e6deb4dd))
* DemoMultipage, DemoShader, DemoShuffle, DemoShuffleShader - Add null checks before cancelling animation frames and timeouts in componentWillUnmount to avoid TypeError when unmounting components with undefined animationFrameID or timeoutID. ([c620c6f](https://github.com/futamura/three-text-geometry/commit/c620c6f4db7e35908b88c4d3c2858e96e5d01a96))
* **effects/shuffle.ts:** remove unnecessary replaceAll() call in shuffleText class constructor ([f50f8f9](https://github.com/futamura/three-text-geometry/commit/f50f8f9f20a951d478c0b9a1962acb92c6df6261))
* error UnhandledPromiseRejectionWarning caused by chalk ([fa030f4](https://github.com/futamura/three-text-geometry/commit/fa030f409ab20c00d7a5041aba2f5f8fb5169c56))
* **eslint:** Resolve TSDoc errors ([3a409b8](https://github.com/futamura/three-text-geometry/commit/3a409b8b61daeb6e017da4c95a335a861856346f))
* remove unused parameter from ShuffleText callback function ([4143ea1](https://github.com/futamura/three-text-geometry/commit/4143ea15c4161a143cbccec47a89d6961cb43582))
* removed --dry-run option ([cd89e96](https://github.com/futamura/three-text-geometry/commit/cd89e96904869116c16c722a5cc16aaaf26b36c4))
* set needsUpdate to true ([6afb9b6](https://github.com/futamura/three-text-geometry/commit/6afb9b6bdcb814e626faede63958609ff8062eed))
* **tests:** Replace gl and three imports with mock versions for testing purposes ([3b528ee](https://github.com/futamura/three-text-geometry/commit/3b528ee38e196b49bcca249328f062a880830ad5))
* TODO: Fix `Rollup failed to resolve import` error ([62bf7cf](https://github.com/futamura/three-text-geometry/commit/62bf7cfdcbf2f77b7deb7c74238d36a3555cb392))
* **tsconfig:** disable incremental compilation due to broken build process (find: dist-cjs and dist-esm: No such file or directory) ([a9a9074](https://github.com/futamura/three-text-geometry/commit/a9a9074c09490b7b5cbfc9f1507142f07144a34f))
* Update dependencies for Three.js and refactor Stats and OrbitControls imports to use addons instead of examples, also update the Stats instance creation to use constructor instead of factory method. ([6e4417a](https://github.com/futamura/three-text-geometry/commit/6e4417a5e026412ae849ce055289b0e6b1d6fad5))
* Update selected option parsing to use cut command for better handling of options with colons in their names ([522de2b](https://github.com/futamura/three-text-geometry/commit/522de2bea0c06e678db7362d634dd573531e7bf3))
* upgrade dependency ([09ab9be](https://github.com/futamura/three-text-geometry/commit/09ab9beb572e0681065cca6c236487ca39e4c648))


### Features

* **ci:** Update CI/CD workflow with version tagging ([b2d5457](https://github.com/futamura/three-text-geometry/commit/b2d545760b6bcf445e8e16ed54b2047a200afb63))
* **demo/src:** update demo shaders to use consistent color value (0x999999) across all demos ([bc877ad](https://github.com/futamura/three-text-geometry/commit/bc877ad79f6648111e122a48f92e2ace15912745))
* **DemoBase:** Add FPS limit ([6f0c2df](https://github.com/futamura/three-text-geometry/commit/6f0c2dfc55d729055a62fba005912484c039efcc))
* **demo:** create basic HTML structure for demo page with Vite setup ([367d43a](https://github.com/futamura/three-text-geometry/commit/367d43a52cd81ffe3873d4c31f55f710a265bca5))
* **demo:** update components to use class syntax instead of constructor function ([cf668ea](https://github.com/futamura/three-text-geometry/commit/cf668eacfbd61c7198c3d59ac2f21a464c9c7338))
* **package-scripts.sh:** Add support for Pnpm and remove Yarn setup script ([9a8836d](https://github.com/futamura/three-text-geometry/commit/9a8836d9a709f849e1cedede8e0131c84035244a))
* **package-scripts.sh:** Add test-e2e script to run E2E tests ([0d72624](https://github.com/futamura/three-text-geometry/commit/0d72624f7e52dbd21213ecadf34e2598202f62d9))
* **package-scripts:** Remove unused build scripts for CommonJS and ESModule, add modules-reinstall script ([7b31627](https://github.com/futamura/three-text-geometry/commit/7b316276c523075f256375ea545abd9382e87489))
* **package.json:** update minify scripts to use uglifyjs for better minification and source map support ([6fcf382](https://github.com/futamura/three-text-geometry/commit/6fcf382c12a76005838936022e7beea3cfe8f4b6))
* release 0.1.0 ([04abfe0](https://github.com/futamura/three-text-geometry/commit/04abfe07f370cfe3af03415f084236a4c826691a))
* Update yarn.sh script to use pnpm and add support for running various tasks with fzf selection, including format fixes, lint checks, build, minify, dev server start, tests, test coverage, cleaning, pre-publish, post-publish, TOC reflection, typedoc generation, and all tasks. ([f0afd39](https://github.com/futamura/three-text-geometry/commit/f0afd392ae26e8ae93291b11d86c8a4f8fdce4cc))

# [0.1.0](https://github.com/futamura/three-text-geometry/compare/0.0.0...0.1.0) (2024-09-03)

### Features

- Bumped `three.js` version from `0.137.5` to `0.167.1`
- Bumped `TypeScript` version from `4.5.5` to `5.5.4`
- Migrated from `react-scripts` to `vite`
- Changed package manager from `yarn` to `pnpm`

## [0.0.1-beta.5](https://github.com/futamura/three-text-geometry/compare/0.0.1-beta.4...0.0.1-beta.5) (2022-02-04)

### Bug Fixes

- error UnhandledPromiseRejectionWarning caused by chalk ([fa030f4](https://github.com/futamura/three-text-geometry/commit/fa030f409ab20c00d7a5041aba2f5f8fb5169c56))

## [0.0.1-beta.4](https://github.com/futamura/three-text-geometry/compare/0.0.1-beta.3...0.0.1-beta.4) (2022-02-03)

### Bug Fixes

- upgrade dependency ([09ab9be](https://github.com/futamura/three-text-geometry/commit/09ab9beb572e0681065cca6c236487ca39e4c648))

## [0.0.1-beta.3](https://github.com/futamura/three-text-geometry/compare/0.0.1-beta.2...0.0.1-beta.3) (2022-02-03)

### Bug Fixes

- build source ([bcfa80c](https://github.com/futamura/three-text-geometry/commit/bcfa80cef3d21d69f6234f244ab78284410b6869))

## [0.0.1-beta.2](https://github.com/futamura/three-text-geometry/compare/0.0.1-beta.1...0.0.1-beta.2) (2022-02-03)

### Bug Fixes

- set needsUpdate to true ([6afb9b6](https://github.com/futamura/three-text-geometry/commit/6afb9b6bdcb814e626faede63958609ff8062eed))

## [0.0.1-beta.1](https://github.com/futamura/three-text-geometry/compare/0.0.0...0.0.1-beta.1) (2021-12-09)

### Bug Fixes

- removed --dry-run option ([cd89e96](https://github.com/futamura/three-text-geometry/commit/cd89e96904869116c16c722a5cc16aaaf26b36c4))
