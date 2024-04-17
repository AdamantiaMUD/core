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
        project: './tsconfig.eslint.json',
        sourceType: 'module',
    },
    'env': {
        browser: false,
        es6: true,
        node: true,
    },
    'plugins': ['prettier'],
    'settings': {
        'import/parsers': {
            '@typescript-eslint/parser': [
                '.ts',
                '.tsx',
                '.d.ts',
            ],
        },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
                project: './tsconfig.eslint.json',
            },
        },
    },
    'ignorePatterns': ['**/*.json', '**/motd', '**/*.yml', '**/*.md', '**/*.txt'],
    'rules': {
        'max-params': ['warn', 8],

        '@typescript-eslint/consistent-type-imports': 'off',
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/no-magic-numbers': 'off',
        '@typescript-eslint/typedef': 'off',

        'import/consistent-type-specifier-style': 'off',
        'import/dynamic-import-chunkname': 'off',
        'import/no-nodejs-modules': 'off',

        'no-restricted-imports': 'off',

        'no-sync': 'off',

        'no-underscore-dangle': 'off',
    },
};
