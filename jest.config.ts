/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */
import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/src/test/jest-polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup-tests.ts'],
  moduleNameMapper: {
    '\\.(css|scss)$': 'jest-transform-css',
    '^.+\\.svg$': 'jest-svg-transformer',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.[t]s?(x)'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '.*\\.d\\.ts$'],
  coverageProvider: 'v8',
  coverageReporters: ['json', 'text', 'lcov'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  transformIgnorePatterns: [
    '/node_modules/(?!wagmi|@wagmi|@tanstack|@pufferfinance|viem)/',
  ],
  globals: {
    Uint8Array,
  },
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node',
    'css',
    'scss',
  ],
};

export default config;
