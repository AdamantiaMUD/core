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
    'rules': {
        'max-params': ['warn', 8],

        '@typescript-eslint/no-magic-numbers': 'off',

        'import/dynamic-import-chunkname': 'off',
        'import/no-nodejs-modules': 'off',

        // @TODO: figure out why these two rules are erroring
        // 'import/extensions': 'off',
        // 'import/no-unresolved': 'off',

        'no-restricted-imports': 'off',

        'no-sync': 'off',

        'no-underscore-dangle': 'off',
    },
};
