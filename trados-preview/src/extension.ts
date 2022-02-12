import * as vscode from 'vscode'
import { BinaryEditor } from './BinaryEditor'
import { TextEditor } from './TextEditor'

export function activate(context: vscode.ExtensionContext): void {
  // 纯文本编辑
  // context.subscriptions.push(TextEditor.register(context))
  // 二进制文件编辑
  context.subscriptions.push(BinaryEditor.register(context))
}
