import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext): void {
  vscode.window
    .showOpenDialog({
      title: 'Select a folder as code-manager workspace',
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
    })
    .then(workspacePath => {
      console.log(workspacePath?.[0].path)
    })

  // console.log(vscode.extensions.all)
  vscode.DocumentHighlight
}
