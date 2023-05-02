# mimir

This is the abbreviated documentation. For details, see our [more complete documentation here.](docs/README.md)

## Getting started

Download and install Node and NPM from https://nodejs.org/en/
Make sure to get the LTS version, not the Current or Latest.

Install latest Enonic XP according to [docs for you platform](https://developer.enonic.com/start)

## Installing dependencies
*Do **not** run `npm install` because this might install the incorrect versions of packages*
*<br>Gradle will do this for you when you run `enonic project deploy`*

## Starting Enonic XP locally in development mode
### Start your sandbox
Open your preferred terminal and run: 
```
enonic sandbox start
```
This will either help you create a new sandbox, or start an existing sandbox

### Build and Deploy
After you have your sandbox up and running, you can build and/or deploy the project by using:
```
enonic project deploy
```
or
```
enonic project build
```
or for a continous build and deploy (needs $XP_HOME and $JAVA_HOME env variables set)
```
./gradlew deploy -t
```

### Development

Start your sandbox in dev mode
```
enonic sandbox start --dev
```

Run an `enonic project deploy` if you haven't already.

Run `npm run dev`, this will start multiple webpack watches in parallel that will watch for changes.

Most changes to files should then be ready after page refresh in a few seconds.

#### Typescript interfaces Code-Gen
We're using the `enonic-ts-codegen` library. This reads through all .xml config files and automatically creates interface files for all parts, layouts, pages, site-config, and content-types. This is a part of the gradle.build pipeline. So they will be regenerated and overwritten on every build. To change the interface you'll have to change the .xml, not the .ts interface files.

#### [Common Errors](./docs/CommonErrors.md)
#### [Eslint](./docs/Eslint.md)

## Login
Direct yout favorite browser to http://localhost:8080

### How to start working on a feature
```
$ git checkout master
$ git pull
$ git checkout -b add-feature-x
... do changes ...
$ git commit -a -m "detailed commit message"
$ git status
... verify that correct files are included ...
$ git push -u origin add-feature-x
... create pull-request to master ...
```

## Deploying builds to environments
### Setup
Upon creating a pull request, Drone builds and tests your branch.  
This build must pass in order for you to merge your pull request.   
Tests will run again on subsequent commits to the same branch.

Upon merging a branch to Master, Drone builds and deploys to Test automatically. 

In order to deploy to QA and PROD, we need to use the drone CLI.   
[Install instructions for Drone CLI can be found here.](https://docs.drone.io/cli/install/)

### Execution
Replace (build-number) with the build number you want to deploy   
Deploying to QA:   
`drone build promote statisticsnorway/mimir (build-number) qa` 

Deploing to PROD:   
`drone build promote statisticsnorway/mimir (build-number) prod`
