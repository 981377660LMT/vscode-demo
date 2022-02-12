import * as vscode from 'vscode'
import { Disposable, disposeAll } from './dispose'

// 单例；即便同一个文件被多个编辑器打开，其背后也是同一个CustomDocument
class BinaryDocument extends Disposable implements vscode.CustomDocument {
  uri: vscode.Uri
}

class BinaryEditor implements vscode.CustomEditorProvider<BinaryDocument> {
  private static readonly viewType = 'trados-preview'
  private readonly context: vscode.ExtensionContext
  // 当用户做了一个编辑操作时，插件需要在CustomEditorProvider中触发onDidChangeCustomDocument事件
  // CustomDocumentContentChangeEvent：最基础的编辑，仅仅告知VS Code一个文档被编辑了(dirty)
  // CustomDocumentEditEvent:一个更加复杂的编辑，支持撤销和恢复（undo/redo）
  // 为了实现undo和redo，你的编辑器要维护一个内部的状态，包括要更新所有的相关webview，留意一个资源可能有多个webview。例如多个图片编辑器实例必须展示相同的像素数据，但是允许每个编辑器有自己的缩放倍数和UI状态
  readonly onDidChangeCustomDocument!:
    | vscode.Event<vscode.CustomDocumentEditEvent<BinaryDocument>>
    | vscode.Event<vscode.CustomDocumentContentChangeEvent<BinaryDocument>>

  static register(context: vscode.ExtensionContext): vscode.Disposable {
    return vscode.window.registerCustomEditorProvider(
      BinaryEditor.viewType,
      new BinaryEditor(context),
      { supportsMultipleEditorsPerDocument: false }
    )
  }

  private constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  //#region CustomEditorProvider
  // 最先执行该方法；该方法可以获取到打开的资源uri，并且一定要给这个资源返回一个新的CustomDocument
  async openCustomDocument(
    uri: vscode.Uri,
    openContext: vscode.CustomDocumentOpenContext,
    token: vscode.CancellationToken
  ): Promise<BinaryDocument> {
    const document = new BinaryDocument(uri)
    return document
  }

  // 第二步执行此方法；在该函数中，我们必须为自定义编辑器的webview赋初始的HTML内容
  // 一旦resolveCustomEditor执行完毕，自定义编辑器就展示给了用户
  resolveCustomEditor(
    document: BinaryDocument,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    console.log('resolve')
    webviewPanel.webview.html = '<h1>Hello world</h1>'
  }

  saveCustomDocument(
    document: BinaryDocument,
    cancellation: vscode.CancellationToken
  ): Thenable<void> {
    // return document.save()
    throw new Error('Method not implemented.')
  }

  saveCustomDocumentAs(
    document: BinaryDocument,
    destination: vscode.Uri,
    cancellation: vscode.CancellationToken
  ): Thenable<void> {
    throw new Error('Method not implemented.')
  }

  revertCustomDocument(
    document: BinaryDocument,
    cancellation: vscode.CancellationToken
  ): Thenable<void> {
    throw new Error('Method not implemented.')
  }

  backupCustomDocument(
    document: BinaryDocument,
    context: vscode.CustomDocumentBackupContext,
    cancellation: vscode.CancellationToken
  ): Thenable<vscode.CustomDocumentBackup> {
    throw new Error('Method not implemented.')
  }

  //#endregion
}

export { BinaryEditor }
