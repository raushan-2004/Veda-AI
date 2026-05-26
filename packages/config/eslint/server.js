/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [require.resolve('./base')],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    // Node/server specific
    'no-console': ['warn', { allow: ['warn', 'error', 'info', 'log'] }],
    '@typescript-eslint/no-require-imports': 'off',
  },
};
