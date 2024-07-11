import sharedConfig from '@epreston/eslint-config';

export default [
  ...sharedConfig,
  {
    name: 'project/rules',
    rules: {
      'prettier/prettier': 'off'
    }
  }
];
