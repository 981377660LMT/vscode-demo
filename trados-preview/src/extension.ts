import * as vscode from 'vscode'
import { DepNodeProvider } from './DepNodeProvider'

export function activate(context: vscode.ExtensionContext): void {
  const rootPath =
    vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined

  const treeDataProvider = new DepNodeProvider(rootPath)
  vscode.window.registerTreeDataProvider('tree-view', treeDataProvider)

  vscode.commands.registerCommand('tree-view.refresh', () => {
    treeDataProvider.refresh()
  })
}
