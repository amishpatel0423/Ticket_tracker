# Ticket Tracer

By Nicholas Bolen (#200455709), 

## To host/run

1. Clone repository
2. Get a copy of the `.env` file *(contains private keys, shared through DMs or supplied by the individual)*
3. Open folder in VSCode
4. Open terminal (<kbd>Ctrl</kbd> + <kbd>\`</kbd> / <kbd>Cmd</kbd> + <kbd>\`</kbd>)
5. `npm ci` *(installs packages)*
6. `npm start` *(starts app)*

## Linter

*Automatic code formatting*

1. Install [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
2. File > Preferences > Settings (<kbd>Ctrl</kbd> + <kbd>,</kbd> / <kbd>Cmd</kbd> + <kbd>,</kbd>)
3. Search for "Code Actions On Save"
4. Edit in `settings.json`
5. Add the following entries:
```
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "eslint.validate": [
        "javascript"
    ]
```
Code should now be automatically formatted on file save

## Git

*There are GUI buttons/extensions available, and VSCode "source control" panel is useful for viewing, staging, commiting, and pushing changes*

To configure Git to stash changes & rebase when you pull, run the following commands once (I recommend this on first time setup):

```
git config pull.rebase true
git config rebase.autoStash true
```

`git fetch` - check if there are updates available\
`git pull` - download updates\
`git add file.txt` - stage changes made to `file.txt` (if changes are staged, that means they will be part of the next commit)\
`git rm file.txt` - remove staged `file.txt` (this file will no longer be part of the next commit)\
`git status` - view which files are currently staged/unstaged
`git commit -m My Message Here` - commits staged changes with input message\
`git reset` - undo a commit or current staging\
`git push` - push all commits on current branch to remote (shared Github repository)

## Example

Here is the Git process for creating this README file (after I have cloned and opened the repository in VSCode):

`git fetch` - No updates, don't need to git pull\
Create and edit `README.md`\
`git add README.md` - stage file creation/changes\
`git status` - Confirming that only `README.md` is staged\
`git commit -m Added README` - Commit changes, with a message describing what I did\
`git push` - Upload changes to shared Github

## Git Exercise

As a simple test of these commands, try adding your name and student numbers to the start of this document. When you've done this properly, it should be visible from the online GitHub repository.