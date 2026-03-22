import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/services/aiSearch/**/*.ts',
    'src/controllers/aiSearch.controller.ts',
    '!src/**/*.interface.ts',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};

export default config;
