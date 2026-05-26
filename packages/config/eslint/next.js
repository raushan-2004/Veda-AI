/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    require.resolve('./base'),
    'next/core-web-vitals',
  ],
  plugins: ['react', 'react-hooks'],
  rules: {
    // React
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Next.js specific
    '@next/next/no-html-link-for-pages': 'off',
  },
};
