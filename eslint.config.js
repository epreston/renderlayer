import sharedConfig from '@epreston/eslint-config';

/** @type { import('eslint').Linter.FlatConfig[] } */
export default [
  ...sharedConfig,
  {
    name: 'project/rules',
    rules: {
      'prettier/prettier': 'off'
    }
  }
];
