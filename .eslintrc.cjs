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

        '@typescript-eslint/indent': [
            'error',
            4,
            {
                ArrayExpression: 1,
                CallExpression: {arguments: 'first'},
                flatTernaryExpressions: false,
                FunctionDeclaration: {
                    body: 1,
                    parameters: 'first',
                },
                FunctionExpression: {
                    body: 1,
                    parameters: 'first',
                },
                ignoreComments: false,
                ignoredNodes: ['TSTypeParameterInstantiation'],
                ImportDeclaration: 1,
                MemberExpression: 1,
                ObjectExpression: 1,
                outerIIFEBody: 1,
                SwitchCase: 1,
                VariableDeclarator: 1,
            },
        ],
    },
};
