/* eslint-disable */

module.exports = {
    extends: ['../../../.eslintrc.cjs'],
    parserOptions: {
        project: '../../../tsconfig.eslint.json',
    },
    settings: {
        'import/resolver': {
            typescript: {
                project: '../../../tsconfig.eslint.json',
            },
        },
    },
    rules: {
        '@typescript-eslint/consistent-type-imports': 'off',
    },
};
