# mimir

This is the abbreviated documentation. For details, see our [more complete documentation here.](docs/README.md)

## Getting started

Download and install Node version **18.12.1** from https://nodejs.org/en/
Make sure to keep the version synced to the one used by gradle, found in `build.gradle` under `node { version: ... }`.

Install latest Enonic CLI according to [docs for you platform](https://developer.enonic.com/start)

## Installing dependencies
Do **not** run `npm install` because this might install the incorrect versions of packages.

Gradle will do this for you when you run `enonic project deploy`.
This command does all the steps necessary to get a finished artifact which can be installed on XP.
It will install dependencies and compile, bundle etc. a production ready JAR file. 

## Starting Enonic XP locally in development mode
### Sandbox
Create a sandbox with the same version as our QA server is running, or as specified by `xpVersion` in `gradle.properties`.

Open your preferred terminal and run: 
```
enonic sandbox start
```
This will either help you create a new sandbox, or start an existing sandbox. It is **not** recommended to put the version number in the sandbox name, since when we upgrade to a new version of XP, the existing sandbox is upgraded.

### Build and Deploy
After you have your sandbox up and running, you can build and/or deploy the project by using:
```
enonic project deploy
```
or
```
enonic project build
```

### Development

Start your sandbox in dev mode
```
enonic sandbox start --dev
```
<br>

Run 
```
enonic project deploy
```
if you haven't already. The first time this is done it creates a connection between your local code repository and the XP server and will enable a better dev mode. 

<br> 

Run
```
npm run dev
```
to start multiple webpack watches in parallel that will watch for changes in TypeScript, JavaScript and SCSS files.

Most changes to files should then be ready after page refresh in a few seconds.

#### Typescript interfaces Code-Gen
We're using the `enonic-ts-codegen` library. This reads through all .xml config files and automatically creates interface files for all parts, layouts, pages, site-config, and content-types. This is a part of the gradle.build pipeline. So they will be regenerated and overwritten on every build. To change the interface you'll have to change the .xml, not the .ts interface files.

#### [Common Errors](./docs/CommonErrors.md)
#### [Eslint](./docs/Eslint.md)

## Login
Direct your favorite browser to http://localhost:8080

### How to start working on a feature
```
$ git checkout master
$ git pull
$ git checkout -b MIMIR-9999_add-feature-x
... do changes ...
$ git commit -a -m "detailed commit message"
$ git status
... verify that correct files are included ...
$ git push -u origin MIMIR-9999_add-feature-x
... create pull-request to master ...
```

Try to start the branchname with the related JIRA task if there is one.

## Deploying builds to environments
### Setup
Upon creating and updating pull requests, Github actions builds and deploys your code to the TEST server where *mabl* runs automatic tests.   
This build and tests must pass in order for you to be able to merge your pull request.   
Tests will run again on subsequent commits to the same branch.

Upon merging a branch to Master, it is built and deployed to QA where *mabl* tests it again.

Deploying to PROD is done manually through a Github action.
