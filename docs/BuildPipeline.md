# Build Pipeline
## Gradle
Caching is enabled on most parts of the build, so it should only run the necessary steps in subsequent builds.

Steps:
1. npmInstall - installs npm packages
2. generateTypeScriptInterfaces - generates ts interfaces from enonic xml configs
3. clientJsWebpack - generates `/assets/js/bundle.js` from `/assets/js/main.es6`
4. clientTsWebpack - generates `/assets/ts/bundle.js` from `/assets/ts/main.ts`
5. [react4xp](./React4xp.md)
6. serverWebpack - transforms all .es6 and .ts files **not** in `/assets` to .js, but ignores all config files generated from `generateTypeScriptInterfaces`
7. stylesWebpack - generates `/assets/styles/bundle.css` from `/assets/styles/main.scss`
8. [testWebpack](./Testing.md)