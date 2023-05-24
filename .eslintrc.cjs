module.exports = {
  root: true,
  extends: ['@block65/eslint-config', '@block65/eslint-config/react'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },

  overrides: [
    {
      files: ['src/examples/**/*', '__tests__/**/*.tsx', '*.config.ts'],
      rules: {
        'import/no-extraneous-dependencies': [
          1,
          {
            devDependencies: true,
          },
        ],
      },
    },
  ],
};
