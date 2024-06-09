module.exports = {
  files: [
    {
      path: './build/*.js',
      maxSize: '4.5 kB',
      compression: 'brotli',
    },
    {
      path: './build/main.js',
      maxSize: '3.5 kB',
      compression: 'brotli',
    },
  ],
};
