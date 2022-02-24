/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DepNodeProvider = void 0;
const vscode = __webpack_require__(1);
const fs = __webpack_require__(3);
const path = __webpack_require__(4);
class Dependency extends vscode.TreeItem {
    constructor(label, version, collapsibleState, command) {
        super(label, collapsibleState);
        this.label = label;
        this.version = version;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.tooltip = `${label}@${version}`;
        this.description = this.version;
        this.iconPath = {
            light: path.join(__dirname, '..', 'assets', 'light', 'dependency.svg'),
            dark: path.join(__dirname, '..', 'assets', 'dark', 'dependency.svg'),
        };
        this.contextValue = 'when触发';
    }
}
class DepNodeProvider {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        console.log('refresh');
        this._onDidChangeTreeData.fire(undefined);
    }
    // 返回树视图的第一层级内容
    getChildren(element) {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No dependency in empty workspace');
            return Promise.resolve([]);
        }
        if (element) {
            // 点击时获取element
            console.log(element);
            return Promise.resolve(this.getDepsInPackageJson(path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')));
        }
        else {
            // 初始化
            const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
            if (this.pathExists(packageJsonPath)) {
                return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
            }
            else {
                vscode.window.showInformationMessage('Workspace has no package.json');
                return Promise.resolve([]);
            }
        }
    }
    getTreeItem(element) {
        return element;
    }
    /**
     * Given the path to package.json, read all its dependencies
     */
    getDepsInPackageJson(packageJsonPath) {
        if (this.pathExists(packageJsonPath)) {
            const toDep = (moduleName, version) => {
                var _a;
                const depPackageJsonPath = path.join((_a = this.workspaceRoot) !== null && _a !== void 0 ? _a : '', 'node_modules', moduleName, 'package.json');
                let collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
                if (this.pathExists(depPackageJsonPath)) {
                    const depPackageJson = JSON.parse(fs.readFileSync(depPackageJsonPath, 'utf-8'));
                    // 如果依赖的代码包已经安装（node_modules有内容），且这个安装包本身有dependencies或devDependencies，才设置为可展开的
                    if ((!depPackageJson.dependencies ||
                        Object.keys(depPackageJson.dependencies).length === 0) &&
                        (!depPackageJson.devDependencies ||
                            Object.keys(depPackageJson.devDependencies).length === 0)) {
                        collapsibleState = vscode.TreeItemCollapsibleState.None;
                    }
                }
                return new Dependency(moduleName, version, collapsibleState);
            };
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            const deps = packageJson.dependencies
                ? Object.keys(packageJson.dependencies).map(dep => toDep(dep, packageJson.dependencies[dep]))
                : [];
            const devDeps = packageJson.devDependencies
                ? Object.keys(packageJson.devDependencies).map(dep => toDep(dep, packageJson.devDependencies[dep]))
                : [];
            return deps.concat(devDeps);
        }
        else {
            return [];
        }
    }
    pathExists(pathLike) {
        try {
            fs.accessSync(pathLike);
        }
        catch (error) {
            return false;
        }
        return true;
    }
}
exports.DepNodeProvider = DepNodeProvider;


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("path");

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
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
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
const vscode = __webpack_require__(1);
const DepNodeProvider_1 = __webpack_require__(2);
function activate(context) {
    const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : undefined;
    const treeDataProvider = new DepNodeProvider_1.DepNodeProvider(rootPath);
    vscode.window.registerTreeDataProvider('tree-view', treeDataProvider);
    vscode.commands.registerCommand('tree-view.refresh', () => {
        treeDataProvider.refresh();
    });
}
exports.activate = activate;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map