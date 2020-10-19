/* eslint-disable array-bracket-newline, array-element-newline, import/no-commonjs, import/unambiguous */

module.exports = {
    'extends': [
        '@chimericdream',
        '@chimericdream/import',
        '@chimericdream/jest',
        '@chimericdream/typescript',
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        ecmaVersion: 2020,
        extraFileExtensions: ['.cjs'],
        project: './tsconfig.eslint.json',
        sourceType: 'module',
    },
    'env': {
        browser: false,
        es6: true,
        node: true,
    },
    'settings': {
        'import/parsers': {
            '@typescript-eslint/parser': [
                '.ts',
                '.tsx',
                '.d.ts',
            ],
        },
    },
    'rules': {
        'max-params': ['warn', 8],

        '@typescript-eslint/no-magic-numbers': 'off',

        'import/dynamic-import-chunkname': 'off',
        'import/no-nodejs-modules': 'off',

        'no-restricted-imports': 'off',

        'no-sync': 'off',

        'no-underscore-dangle': 'off',
    },
};
