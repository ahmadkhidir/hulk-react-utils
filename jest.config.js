export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'jsdom',
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            useESM: true,
            tsconfig: {
                jsx: 'react-jsx',
            },
        }],
    },
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setupTests.ts'],
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.test.(ts|tsx)',
        '<rootDir>/src/**/*.test.(ts|tsx)',
        '<rootDir>/src/**/*.spec.(ts|tsx)'
    ],
    testPathIgnorePatterns: [
        '<rootDir>/src/__tests__/setupTests.ts'
    ],
    collectCoverageFrom: [
        'src/**/*.(ts|tsx)',
        '!src/**/*.d.ts',
        '!src/index.ts',
        '!src/__tests__/setupTests.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    testTimeout: 10000,
};