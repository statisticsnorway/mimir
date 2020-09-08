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
