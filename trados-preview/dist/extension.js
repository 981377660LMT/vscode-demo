/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BinaryEditor = void 0;
const vscode = __webpack_require__(1);
const dispose_1 = __webpack_require__(3);
/**
 * Define the document (the data model) used for paw draw files.
 *
 * 单例；即便同一个文件被多个编辑器打开，其背后也是同一个CustomDocument
 */
class BinaryDocument extends dispose_1.Disposable {
    constructor(uri, initialContent, delegate) {
        super();
        this.edits = [];
        this.savedEdits = [];
        this.uri = uri;
        this.fileData = initialContent;
        this.delegate = delegate;
        this.onDidDisposeEmitter = this._register(new vscode.EventEmitter());
        this.onDidDispose = this.onDidDisposeEmitter.event;
        this.onDidChangeContentEmitter = this._register(new vscode.EventEmitter());
        this.onDidChangeContent = this.onDidChangeContentEmitter.event;
        this.onDidChangeEmitter = this._register(new vscode.EventEmitter());
        this.onDidChange = this.onDidChangeEmitter.event;
    }
    // delegate 是委托什么？
    static create(uri, backupId, delegate) {
        return __awaiter(this, void 0, void 0, function* () {
            // If we have a backup, read that. Otherwise read the resource from the workspace
            const dataFile = typeof backupId === 'string' ? vscode.Uri.parse(backupId) : uri;
            const fileData = yield BinaryDocument.readFile(dataFile);
            return new BinaryDocument(uri, fileData, delegate);
        });
    }
    static readFile(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (uri.scheme === 'untitled') {
                return new Uint8Array();
            }
            return yield vscode.workspace.fs.readFile(uri);
        });
    }
    /**
     * Called by VS Code when there are no more references to the document.
     *
     * This happens when all editors for it have been closed.
     *
     * document 失去所有引用
     */
    dispose() {
        this.onDidDisposeEmitter.fire();
        super.dispose();
    }
    /**
     * Called when the user edits the document in a webview.
     *
     * This fires an event to notify VS Code that the document has been edited.
     *
     * 当用户在webview中编辑document时，触发事件，通知VS Code document被编辑了
     */
    makeEdit(edit) {
        this.edits.push(edit);
        this.onDidChangeEmitter.fire({
            label: 'Stroke',
            undo: () => {
                this.edits.pop();
                this.onDidChangeContentEmitter.fire({
                    edits: this.edits,
                });
            },
            redo: () => {
                this.edits.push(edit);
                this.onDidChangeContentEmitter.fire({
                    edits: this.edits,
                });
            },
        });
    }
    /**
     * Called by VS Code when the user saves the document.
     */
    save(cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveAs(this.uri, cancellation);
            this.savedEdits = [...this.edits];
        });
    }
    /**
     * Called by VS Code when the user saves the document to a new location.
     */
    saveAs(targetResource, cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileData = yield this.delegate.getFileData();
            if (cancellation.isCancellationRequested) {
                return;
            }
            yield vscode.workspace.fs.writeFile(targetResource, fileData);
        });
    }
    /**
     * Called by VS Code when the user calls `revert` on a document.
     *
     * 回退
     */
    revert(_cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            const diskContent = yield BinaryDocument.readFile(this.uri);
            this.fileData = diskContent;
            this.edits = this.savedEdits;
            this.onDidChangeContentEmitter.fire({
                content: diskContent,
                edits: this.edits,
            });
        });
    }
    /**
     * Called by VS Code to backup the edited document.
     *
     * These backups are used to implement hot exit.
     *
     * Hot Exit：应用程序崩溃或退出时防止丢失任何未经保存的修改信息
     */
    backup(destination, cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveAs(destination, cancellation);
            return {
                id: destination.toString(),
                delete: () => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield vscode.workspace.fs.delete(destination);
                    }
                    catch (_a) { }
                }),
            };
        });
    }
}
class BinaryEditor {
    constructor(context) {
        this.webviews = new WebviewCollection();
        //#endregion
        this.requestId = 1;
        this.callbacks = new Map();
        this.context = context;
        this.onDidChangeCustomDocumentEmitter = new vscode.EventEmitter();
        this.onDidChangeCustomDocument = this.onDidChangeCustomDocumentEmitter.event;
    }
    static register(context) {
        return vscode.window.registerCustomEditorProvider(BinaryEditor.viewType, new BinaryEditor(context), { supportsMultipleEditorsPerDocument: false });
    }
    //#region CustomEditorProvider
    // 最先执行该方法；该方法可以获取到打开的资源uri，并且一定要给这个资源返回一个新的CustomDocument
    openCustomDocument(uri, openContext, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = yield BinaryDocument.create(uri, openContext.backupId, {
                getFileData: () => __awaiter(this, void 0, void 0, function* () {
                    const webviewsForDocument = Array.from(this.webviews.get(document.uri));
                    if (!webviewsForDocument.length) {
                        throw new Error('Could not find webview to save for');
                    }
                    const panel = webviewsForDocument[0];
                    // 返回webview中的图像
                    const response = yield this.postMessageWithResponse(panel, 'getFileData', {});
                    return new Uint8Array(response);
                }),
            });
            const listeners = [];
            listeners.push(document.onDidChange(e => {
                // Tell VS Code that the document has been edited by the use.
                this.onDidChangeCustomDocumentEmitter.fire(Object.assign({ document }, e));
            }));
            listeners.push(document.onDidChangeContent(e => {
                // Update all webviews when the document changes
                for (const webviewPanel of this.webviews.get(document.uri)) {
                    this.postMessage(webviewPanel, 'update', {
                        edits: e.edits,
                        content: e.content,
                    });
                }
            }));
            document.onDidDispose(() => (0, dispose_1.disposeAll)(listeners));
            return document;
        });
    }
    // 第二步执行此方法；在该函数中，我们必须为自定义编辑器的webview赋初始的HTML内容
    // 一旦resolveCustomEditor执行完毕，自定义编辑器就展示给了用户
    resolveCustomEditor(document, webviewPanel, token) {
        console.log('resolve');
        // Add the webview to our internal set of active webviews
        this.webviews.add(document.uri, webviewPanel);
        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true,
        };
        webviewPanel.webview.html = 'hello world';
        webviewPanel.webview.onDidReceiveMessage(e => this.onMessage(document, e));
    }
    saveCustomDocument(document, cancellation) {
        // return document.save()
        console.log('save');
        return document.save(cancellation);
    }
    saveCustomDocumentAs(document, destination, cancellation) {
        console.log('saveAs');
        return document.saveAs(destination, cancellation);
    }
    revertCustomDocument(document, cancellation) {
        console.log('revert');
        return document.revert(cancellation);
    }
    backupCustomDocument(document, context, cancellation) {
        console.log('backup');
        return document.backup(context.destination, cancellation);
    }
    postMessageWithResponse(panel, type, body) {
        const requestId = this.requestId++;
        const p = new Promise(resolve => this.callbacks.set(requestId, resolve));
        panel.webview.postMessage({ type, requestId, body });
        return p;
    }
    onMessage(document, message) {
        switch (message.type) {
            case 'stroke':
                document.makeEdit(message);
                return;
            case 'response': {
                const callback = this.callbacks.get(message.requestId);
                callback === null || callback === void 0 ? void 0 : callback(message.body);
                return;
            }
        }
    }
    postMessage(panel, type, body) {
        panel.webview.postMessage({ type, body });
    }
}
exports.BinaryEditor = BinaryEditor;
BinaryEditor.viewType = 'trados-preview';
/**
 * Tracks all webviews.
 */
class WebviewCollection {
    constructor() {
        this.webviews = new Set();
    }
    /**
     * Get all known webviews for a given uri.
     */
    *get(uri) {
        const key = uri.toString();
        for (const entry of this.webviews) {
            if (entry.resource === key) {
                yield entry.webviewPanel;
            }
        }
    }
    /**
     * Add a new webview to the collection.
     */
    add(uri, webviewPanel) {
        const entry = { resource: uri.toString(), webviewPanel };
        this.webviews.add(entry);
        webviewPanel.onDidDispose(() => {
            this.webviews.delete(entry);
        });
    }
}


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Disposable = exports.disposeAll = void 0;
function disposeAll(disposables) {
    while (disposables.length) {
        // 出栈
        const item = disposables.pop();
        if (item) {
            item.dispose();
        }
    }
}
exports.disposeAll = disposeAll;
// 回收资源
class Disposable {
    constructor() {
        this._isDisposed = false;
        this._disposables = [];
    }
    dispose() {
        if (this._isDisposed) {
            return;
        }
        this._isDisposed = true;
        disposeAll(this._disposables);
    }
    get isDisposed() {
        return this._isDisposed;
    }
    _register(value) {
        if (this._isDisposed) {
            value.dispose();
        }
        else {
            this._disposables.push(value);
        }
        return value;
    }
}
exports.Disposable = Disposable;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = void 0;
const BinaryEditor_1 = __webpack_require__(2);
function activate(context) {
    // 纯文本编辑
    // context.subscriptions.push(TextEditor.register(context))
    // 二进制文件编辑
    context.subscriptions.push(BinaryEditor_1.BinaryEditor.register(context));
}
exports.activate = activate;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map