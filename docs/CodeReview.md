 # Code Review

 ## Checklist
- [ ] Checkout branch and make sure it compiles
- [ ] `npm run lint-dry` to check for linting warnings/errors
- [ ] Check i18n: that controllers use i18n and properties functions.
- [ ] Check code in [w3's validator](https://validator.w3.org)
- [ ] Do unit tests run without errors and warnings? 
- [ ] Have we written unit tests for complex code (more than a controller)?
- [ ] Have libraries been tested? Public / Export-ing libraries tested?
- [ ] Is the code readable? 
- [ ] Are functions, classes and variables named well?
- [ ] If the code has some complexity; Comments? Documentation?
- [ ] Regexp or "clever" code - could it be simplified?
- [ ] Is there error messages for missing or malformed inputs or does the code just crash?

