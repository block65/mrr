module.exports = {
  files: [
    {
      path: './build/*.js',
      maxSize: '4 kB',
      compression: 'brotli',
    },
    {
      path: './build/main.js',
      maxSize: '3 kB',
      compression: 'brotli',
    },
  ],
};
