import sharedConfig from '@epreston/eslint-config';

/** @type { import('eslint').Linter.Config[] } */
export default [
  ...sharedConfig,
  {
    // ignores must be completely separate from other rules
    name: 'project/ignores',
    ignores: ['**/packages/*/lib', '**/packages/*/inc']
  }
  // {
  //   name: 'project/rules',
  //   rules: {
  //     'no-console': 'off',
  //   }
  // }
];
