/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
            },
        ],
    },
    testMatch: [
        '**/tests/integration/**/*.ts',
    ],
    extensionsToTreatAsEsm: ['.ts'],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/tests/test-utils.ts',
    ],
};
