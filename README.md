# mimir

## Getting started

Download and install Node and NPM from https://nodejs.org/en/
Make sure to get the LTS version, not the Current or Latest.

Install latest Enonic XP according to docs for you platform

## Installing dependencies
*Must be done once after checking out, and again if new dependencies are added*
`npm install`

## Starting Enonic XP locally in development mode
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
