# Build Pipeline
## Gradle
Caching is enabled on most parts of the build, so it should only run the necessary steps in subsequent builds.

Steps:
1. npmInstall - installs npm packages
2. generateTypeScriptInterfaces - generates ts interfaces from enonic xml configs
3. compileAssets - generates compiled assets files from `/src/main/resources/assets`
4. compileServer - generates compiled JS from `.ts` and `.es6` files to be used server-side on XP
5. [react4xp](./React4xp.md)
6. [testWebpack](./Testing.md)
