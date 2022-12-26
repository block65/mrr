module.exports = {
  root: true,
  extends: [
    '@block65/eslint-config/typescript',
    '@block65/eslint-config/react',
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
};
