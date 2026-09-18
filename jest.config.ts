import * as Fs from 'fs'
import type { Config } from '@jest/types'
import { pathsToModuleNameMapper } from 'ts-jest'
import TypeScript from 'typescript'

const tsconfig = TypeScript.readConfigFile('tsconfig.json', (path) =>
  Fs.readFileSync(path, { encoding: 'utf-8' })
)

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.config.compilerOptions.paths, {
    prefix: '<rootDir>',
  }),
  resolver: 'ts-jest-resolver',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
    'jest-watch-select-projects',
    'jest-watch-suspend',
  ],
  modulePathIgnorePatterns: ['<rootDir>/demo/'],
  // e2e/*.spec.ts is Playwright's, and it matches jest's default testMatch.
  testPathIgnorePatterns: ['<rootDir>/e2e/', '<rootDir>/node_modules/'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    // three is ESM-only since r186 (build/three.cjs only does require(esm)), so its build files are transpiled to CommonJS.
    '^.+/node_modules/three/build/.+\\.js$': ['ts-jest', { tsconfig: { allowJs: true }, diagnostics: false }],
  },
  transformIgnorePatterns: ['/node_modules/(?!(\\.pnpm/three@[^/]+/node_modules/)?three/build/)'],
  testEnvironment: 'node',
}

export default config
