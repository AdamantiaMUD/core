const base = require('../.eslintrc.cjs');

module.exports = {
    ...base,
    root: true,
    'parserOptions': {
        project: './tsconfig.eslint.json',
    },
};
