# Admin Tool Applications
## Summary
In order to create a functionally distinct 'app' in XP, we can use [admin tools](https://developer.enonic.com/docs/xp/stable/admin#admin_tools). We have done this to make the Dashboard Best Bet applications, which offer features we do not want to create in Content Studio. These applications offer access to our tooling, utils and resources like all other XP code, but we have ran into some limitations. 

## React
Similarly to Typescript, React turned out to not build correctly when the React components were placed in the same folder as the .es6 and .xml files under the admin directory. It seems to be an assumption in the react4xp library that all react files for parts and pages are placed under /src/main/resources/site - and we made use of the [_entries](https://developer.enonic.com/docs/react4xp/master/entries) directory in order to use React in our applications. 

## Controller pattern
We considered several approaches when building the Best Bet application. We needed HTTP endpoints for GET, PUT, DELETE and POST in order to make our CRUD application. We tried adding these to the .es6 controller for the page, but we struggled to get POST working as intended. In the end, we created a service for these features instead. 
