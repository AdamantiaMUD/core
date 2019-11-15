/* global module */

module.exports = {
    'extends': [
        '@chimericdream',
        '@chimericdream/jest',
        '@chimericdream/typescript',
    ],
    parserOptions: {
        project: './tsconfig.json',
    },
    'env': {
        browser: false,
        es6: true,
        node: true,
    },
    'rules': {
        'no-magic-numbers': 'off',
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
