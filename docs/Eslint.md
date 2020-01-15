# Eslint
## Commands
Tries to automaticly fix all .es6|.ts|.jsx files based on .eslintrc

`npm run lint`


Same as lint, but doesn't fix the files, just creates the error/warning dump in console

`npm run lint-dry`

## Setup
### Visual Studio Code
Install eslint globally<br>
`npm install eslint -g`

Install Eslint Plugin: 
```
Name: ESLint
Id: dbaeumer.vscode-eslint
Description: Integrates ESLint JavaScript into VS Code.
Version: 2.0.14
Publisher: Dirk Baeumer
VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint\
```
Update VSCode workspace- or userconfig:
```
  "eslint.enable": true,
  "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
  },
```
If you don't want it to automaticly lint the current file on save, omit the `codeActionsOnSave` config
### IntelliJ
TODO

## Config
Eslint is setup to lint .es6, .ts, and .jsx files. Each of these share one [common config](/common.eslintrc.json), with overrides in [.eslintrc.json](/.eslintrc.json)

[Eslint rules documentation](https://eslint.org/docs/rules/)<br>
[Typescript rules documentation](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules)<br>
[React rules documentation](https://github.com/yannickcr/eslint-plugin-react/#list-of-supported-rules)<br>

If you want to add specific rules to either .es6, .ts or .jsx, then you'll have to do this inside [.eslintrc.json](/.eslintrc.json). For .es6, add `"rules": { /*my rules */ }` to the root object. For .ts or .jsx, add it to the respective overrides.rules objects.