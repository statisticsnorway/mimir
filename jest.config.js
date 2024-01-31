module.exports = {
  testMatch: ['**/src/**/*-test.[tj]s?(x)'],
  moduleNameMapper: {
    // Example: If relying on relative imports in ts files to make test work one might need to map the module here
    '^/lib/vendor/(.*)$': '<rootDir>/src/main/resources/lib/vendor/$1',
    // '^/lib/enonic/react4xp$': '<rootDir>/node_modules/@enonic/react4xp',
    // '^/lib/(?!xp)(.*)$': [
    //   '<rootDir>/src/main/resources/lib/$1',
    //   '<rootDir>/src/main/resources/lib/types/$1/$1',
    //   '<rootDir>/src/main/resources/lib/ssb/$1/$1',
    // ],
    // '^/react4xp/(.*)$': '<rootDir>/src/main/resources/react4xp/$1',
    // '^/services/(.*)$': '<rootDir>/src/main/resources/services/$1',
    // '^/site/(.*)$': ['<rootDir>/.xp-codegen/site/$1', '<rootDir>/src/main/resources/site/$1'],
    // '^/tasks/(.*)$': ['<rootDir>/.xp-codegen/tasks/$1', '<rootDir>/src/main/resources/tasks/$1'],
  },
}
