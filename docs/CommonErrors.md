# Common Errors

## node-sass
If you're getting this error: 
```
Error: Missing binding ~/git-repos/mimir/node_modules/node-sass/vendor/darwin-x64-64/binding.node
    Node Sass could not find a binding for your current environment: OS X 64-bit with Node.js 10.x
    Found bindings for the following environments:
      - OS X 64-bit with Node.js 12.x
```
Then you have most likely installed npm packages outside of gradle<br>
**DO NOT** run `npm install` yourself, let gradle do it the first time you run `enonic project build`

Fix:<br>
Delete your node_modules folder, and run `enonic project deploy`

## NSI

```> Configure project :
react4xp.properties#buildEnv is set to 'development':
OVERRIDING VANILLA npmInstall IN FAVOR OF node-safe-install (nsi).
> Task :clientWebpack FAILED
internal/modules/cjs/loader.js:638
    throw err;
    ^
Error: Cannot find module '~/git-repos/mimir/node_modules/webpack-cli/bin/cli.js'
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:636:15)
    at Function.Module._load (internal/modules/cjs/loader.js:562:25)
    at Function.Module.runMain (internal/modules/cjs/loader.js:829:12)
    at startup (internal/bootstrap/node.js:283:19)
    at bootstrapNodeJSCore (internal/bootstrap/node.js:622:3)
FAILURE: Build failed with an exception.
* What went wrong:
Execution failed for task ':clientWebpack'.
> Process 'command '~/git-repos/mimir/.gradle/nodejs/node-v10.16.0-darwin-x64/bin/node'' finished with non-zero exit value 1
* Try:
Run with --stacktrace option to get the stack trace. Run with --info or --debug option to get more log output. Run with --scan to get full insights.
* Get more help at https://help.gradle.org
Deprecated Gradle features were used in this build, making it incompatible with Gradle 6.0.
Use '--warning-mode all' to show the individual deprecation warnings.
See https://docs.gradle.org/5.3/userguide/command_line_interface.html#sec:command_line_warnings
BUILD FAILED in 1s
7 actionable tasks: 2 executed, 5 up-to-date
```

Fix: 
1. If gradle is installed globally, check that you use version defined in [gradle-wrapper](/gradle/wrapper/gradle-wrapper.properties)
2. Delete the `.gradle` folder in the root folder of your project