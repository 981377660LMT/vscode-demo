CustomTextEditorProvider => 一般用于处理文本文件(例如 json)

CustomReadonlyEditorProvider<D> => 一般用于处理二进制文件(例如 json)，但是只需要显示
CustomEditorProvider<D> => 一般用于处理二进制文件，需要实现 undo/redo/save/revert 等方法

CustomTextEditorProvider 利用 VS Code 的标准 纯文本文档 作为数据模型
CustomEditorProvider 则是需要插件`用自己的文档模型`

- 如果是纯文本文档，优先考虑 CustomTextEditor

- 其实不少自定义编辑器根本不需要编辑功能，例如实现图片预览或内存快照文件的可视化，都不需要用到编辑功能，这就是 CustomReadonlyEditorProvider 的用武之地。CustomReadonlyEditorProvider 让你可以创建一个不支持编辑的自定义编辑器，可以用来展示内容，但不支持撤销或保存等操作。和支持编辑功能的自定义编辑器相比，只读型实现起来更为简单。
