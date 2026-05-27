/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['../../packages/config/eslint/base.js'],
  rules: {
    'import/no-unresolved': 'off',
    'import/order': 'off',
    'import/namespace': 'off',
    'import/no-duplicates': 'off',
    'import/no-named-as-default-member': 'off',
    'import/no-cycle': 'off',
    'import/default': 'off',
    'import/no-named-as-default': 'off',
    'import/export': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': 'off',
  },
};
