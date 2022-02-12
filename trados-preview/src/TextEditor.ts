import * as vscode from 'vscode'

class TextEditor implements vscode.CustomTextEditorProvider {
  private static readonly viewType = 'trados-preview'
  private readonly context: vscode.ExtensionContext

  static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new TextEditor(context)
    const registration = vscode.window.registerCustomEditorProvider(TextEditor.viewType, provider)
    return registration
  }

  private constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  /**
   * Called when our custom editor is opened.
   * @param document vscode自身的文档模型
   * @param webviewPanel webview显示的panel
   * @param token 取消操作的token
   * @description 根据document和webview就可以展示文档的内容
   */
  resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    console.log(document.fileName)
    console.log(document.getText())
    console.log(document.getWordRangeAtPosition(new vscode.Position(2, 2)))
    console.log(document.languageId)
    console.log(document.lineAt(2))
    console.log(document.version)

    webviewPanel.webview.html = document.getText() + 66666

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.uri.toString() === document.uri.toString()) {
        updateWebview()
      }
    })
    // Make sure we get rid of the listener when our editor is closed.
    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose()
    })

    // Receive message from the webview.
    webviewPanel.webview.onDidReceiveMessage(e => {
      switch (e.type) {
        case 'add':
          this.addNewItem(document)
          return
        case 'delete':
          this.deleteItem(document, e.id)
          return
      }
    })

    updateWebview()

    function updateWebview(): void {
      webviewPanel.webview.postMessage({
        type: 'update',
        text: document.getText(),
      })
    }
  }

  private addNewItem(document: vscode.TextDocument) {
    throw new Error('Method not implemented.')
  }

  private deleteItem(document: vscode.TextDocument, id: string) {
    throw new Error('Method not implemented.')
  }

  private updateTextDocument(document: vscode.TextDocument, json: any) {
    const edit = new vscode.WorkspaceEdit()
    // Just replace the entire document every time for this example extension.
    // A more complete extension should compute minimal edits instead.
    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      JSON.stringify(json, null, 2)
    )

    return vscode.workspace.applyEdit(edit)
  }
}

export { TextEditor }
