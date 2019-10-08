/* eslint-disable array-bracket-newline, array-element-newline */

module.exports = {
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts',
        '!<rootDir>/src/**/*.test.ts',
        '!<rootDir>/src/index.ts',
    ],
    roots: ['<rootDir>/src'],
    transform: {'^.+\\.ts$': 'ts-jest'},
    testRegex: '^.*\\.test\\.ts$',
};
