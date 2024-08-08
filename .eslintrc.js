module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },

  extends: [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    camelcase: [0],
    'eol-last': [0],
    'func-names': [0],
    'dot-notation': [0],
    'keyword-spacing': [0],
    'arrow-body-style': [0],
    'consistent-return': [0],
    'no-trailing-spaces': [0],
  },
};
