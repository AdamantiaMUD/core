/* eslint-disable array-bracket-newline, array-element-newline, import/no-commonjs, import/unambiguous */
const path = require('path');

module.exports = {
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts',
        '!<rootDir>/src/index.ts',
    ],

    moduleNameMapper: {
        '^~/(.*)$': path.resolve(__dirname, './src/$1'),
    },

    roots: ['<rootDir>/test'],

    testRegex: '^.*\\.test\\.ts$',

    transform: {'^.+\\.ts$': 'ts-jest'},
};
