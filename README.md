# mimir

## Getting started

Download and install Node and NPM from https://nodejs.org/en/
Make sure to get the LTS version, not the Current or Latest.

Install latest Enonic XP according to docs for you platform

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

## [Documentation](./docs/README.md)