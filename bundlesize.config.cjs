module.exports = {
  files: [
    {
      path: './build/*.js',
      maxSize: '3.6 kB',
      compression: 'brotli',
    },
    {
      path: './build/main.js',
      maxSize: '8 kB',
    },
  ],
};
