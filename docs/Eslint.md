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