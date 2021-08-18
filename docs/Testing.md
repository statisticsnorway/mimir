# Testing
## Unit Tests
### Writing unit tests
Unit tests are placed under `src/test/resources/`  
Each unit test es6 file must be called by java code in a corresponding class. This is [documented by Enonic here](https://developer.enonic.com/guides/writing-unit-tests)

Mocking unit tests is a little tricky - the mocking must be completed before including the library you want to test. So if you want to mock the "content" library that is used in the "utils" helper library, you must first mock "content" and then import "utils." An example of this can be seen in `src/test/resources/lib/ssb/utils-test.es6`

### Running unit tests
All unit tests are ran when building the project with `enonic project build`.   
After a test run, a report is generated and placed under `build/reports/tests/test/index.html` - open it in your browser to see details. If any of your tests fail, the build command will exit with failure status, and you will see information about the failing tests with a link to the report. More details and a full stack trace can be found there. 

## End-to-end testing
### Mabl
We have a test suite in Mabl which currently runs as a part of our QA deploy job. It verifies our UI and can be configured to notify us on major changes. Apart from this, it allows us to easily test functionality in the browser, confirm that our code runs correctly and looks as expected on vaious screen sizes. 

More information on how to run Mabl locally and how to write good tests [can be found on their website.](https://help.mabl.com) 

## Performance testing with Gatling
### Setup
- Download and unpack Gatling [open source package](https://gatling.io/open-source/). 
- Unzip the package in a suitable location (windows users are adviced to avoid C:\Programs and similar folders due to permission restrictions)
- Delete the example "user-files" folder from the unzipped package
- Either do one or the other of these: 
  - Make a symlink between the [gatling](/gatling) folder in the Mimir project and your unzipped package
  It would look something like this: `ln -s /Users/Alice/git-repos/mimir/gatling user-files`
  - Copy the [gatling](/gatling) folder from the mimir code base into the unzipped Gatling package. Remember to *rename* the folder to "user-files" - Gatling looks for this folder! 
- Test that the package can be ran by executing the run script in the unzipped package: `bin/gatling.sh`
  the output should look something like this: 
```bash
$> bin/gatling.sh
GATLING_HOME is set to /Users/Alice/Downloads/gatling-charts-highcharts-bundle-3.6.1
ssbTest.SsbPerformanceTests is the only simulation, executing it.
Select run description (optional)
``` 

### Adapting the tests
In order to bypass Varnish, we will sometimes want to run the tests directly towards XP. Don't forget to comment out the "baseUrl" directive and replace it with the correct addres, pointing to the desired installation. This will ensure that every request reaches XP and while not very realistic, can give us a more precise measurement of performance gains or losses over time. 

### Working with Gatling
Further improvements and more test coverage might be a useful addition. 
- Begin with the [quick start](https://gatling.io/docs/gatling/tutorials/quickstart/) to Gatling
- Refer do the [Cheat sheet](https://gatling.io/docs/gatling/reference/current/cheat-sheet/) and further documentation for reference. 
- The Gatling zip package contains useful examples, don't forget to check them out!