/* eslint-disable import/unambiguous,import/no-commonjs */

module.exports = {
    extends: ['../.eslintrc.cjs'],
    'parserOptions': {
        project: '../tsconfig.eslint.json',
    },
    'settings': {
        'import/resolver': {
            typescript: {
                project: '../tsconfig.eslint.json',
            },
        },
    },
    rules: {
        'max-lines-per-function': 'off',
        'max-nested-callbacks': 'off',
    },
};
