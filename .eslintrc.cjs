// https://eslint.org/docs/user-eguide/configuring/
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb-base',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  plugins: ['import', '@typescript-eslint'],
  rules: {
    'max-len': ['error', { code: 120 }], // Max 120 characters wide
    indent: ['error', 2, { // Use indentation of 2
      CallExpression: {
        arguments: 1,
      },
      FunctionDeclaration: {
        body: 1,
        parameters: 1,
      },
      FunctionExpression: {
        body: 1,
        parameters: 1,
      },
      MemberExpression: 1,
      ObjectExpression: 1,
      SwitchCase: 1,
      ignoredNodes: ['ConditionalExpression'],
    }],
    semi: ['error', 'always'], // Always add ;
    'no-restricted-syntax': ['off', { selector: 'ForOfStatement' }], // Allow for-of loops
    'no-underscore-dangle': ['error', { 'allow': ['__filename', '__dirname'] }], // Allow custom underscore dangles
    'no-unused-vars': 'off', // Turn off unused vars, because it doesn't work with typescript ...
    '@typescript-eslint/no-unused-vars': ['error'], // ... and use the typescript version instead
    'no-shadow': 'off', // Turn off shadowing, because it doesn't work with typescript ...
    '@typescript-eslint/no-shadow': ['error'], // ... and use the typescript version instead
    '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }], // Allow ts-ignore (for now) with a description
    'import/no-extraneous-dependencies': ['error', {devDependencies: true}], // Allow imports from dev-dependencies
  },
  settings: {
    'import/resolver': {
      typescript: {},
      alias: [
        ['@', './src'],
      ],
    },
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
    webextensions: true,
  },
};
