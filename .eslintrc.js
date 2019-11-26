/* global module */

module.exports = {
    'extends': [
        '@chimericdream',
        '@chimericdream/jest',
        '@chimericdream/typescript',
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        ecmaVersion: 2020,
        project: './tsconfig.eslint.json',
        sourceType: 'module',
    },
    'env': {
        browser: false,
        es6: true,
        node: true,
    },
    'rules': {
        '@typescript-eslint/no-magic-numbers': 'off',

        'no-restricted-imports': 'off',

        'no-sync': 'off',

        'no-underscore-dangle': [
            'error',
            {
                allow: ['__', '_id', '__pruned', '__hydrated'],
                allowAfterSuper: true,
                allowAfterThis: true,
                enforceInMethodNames: true,
            },
        ],
    },
};
