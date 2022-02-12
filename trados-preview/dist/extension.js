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
// 单例；即便同一个文件被多个编辑器打开，其背后也是同一个CustomDocument
class BinaryDocument extends dispose_1.Disposable {
}
class BinaryEditor {
    constructor(context) {
        this.context = context;
    }
    static register(context) {
        return vscode.window.registerCustomEditorProvider(BinaryEditor.viewType, new BinaryEditor(context), { supportsMultipleEditorsPerDocument: false });
    }
    //#region CustomEditorProvider
    // 最先执行该方法；该方法可以获取到打开的资源uri，并且一定要给这个资源返回一个新的CustomDocument
    openCustomDocument(uri, openContext, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = new BinaryDocument(uri);
            return document;
        });
    }
    // 第二步执行此方法；在该函数中，我们必须为自定义编辑器的webview赋初始的HTML内容
    // 一旦resolveCustomEditor执行完毕，自定义编辑器就展示给了用户
    resolveCustomEditor(document, webviewPanel, token) {
        console.log('resolve');
        webviewPanel.webview.html = '<h1>Hello world</h1>';
    }
    saveCustomDocument(document, cancellation) {
        // return document.save()
        throw new Error('Method not implemented.');
    }
    saveCustomDocumentAs(document, destination, cancellation) {
        throw new Error('Method not implemented.');
    }
    revertCustomDocument(document, cancellation) {
        throw new Error('Method not implemented.');
    }
    backupCustomDocument(document, context, cancellation) {
        throw new Error('Method not implemented.');
    }
}
exports.BinaryEditor = BinaryEditor;
BinaryEditor.viewType = 'trados-preview';


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