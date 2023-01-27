module.exports = {
  plugins: ['no-relative-import-paths'],
  rules: {
    'no-relative-import-paths/no-relative-import-paths': [
      'warn',
      {
        allowSameFolder: true,
        rootDir: './',
      },
    ],
  },
}
