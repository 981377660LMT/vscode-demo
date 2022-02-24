import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private readonly version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState)
    this.tooltip = `${label}@${version}`
    this.description = this.version

    this.iconPath = {
      light: path.join(__dirname, '..', 'assets', 'light', 'dependency.svg'),
      dark: path.join(__dirname, '..', 'assets', 'dark', 'dependency.svg'),
    }

    this.contextValue = 'when触发'
  }
}

class DepNodeProvider implements vscode.TreeDataProvider<Dependency> {
  onDidChangeTreeData: vscode.Event<Dependency | undefined>
  private workspaceRoot: string | undefined
  private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined>

  constructor(workspaceRoot: string | undefined) {
    this.workspaceRoot = workspaceRoot
    this._onDidChangeTreeData = new vscode.EventEmitter()
    this.onDidChangeTreeData = this._onDidChangeTreeData.event
  }

  refresh(): void {
    console.log('refresh')
    this._onDidChangeTreeData.fire(undefined)
  }

  // 返回树视图的第一层级内容
  getChildren(element?: Dependency): vscode.ProviderResult<Dependency[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No dependency in empty workspace')
      return Promise.resolve([])
    }

    if (element) {
      // 点击时获取element
      console.log(element)
      return Promise.resolve(
        this.getDepsInPackageJson(
          path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')
        )
      )
    } else {
      // 初始化
      const packageJsonPath = path.join(this.workspaceRoot, 'package.json')
      if (this.pathExists(packageJsonPath)) {
        return Promise.resolve(this.getDepsInPackageJson(packageJsonPath))
      } else {
        vscode.window.showInformationMessage('Workspace has no package.json')
        return Promise.resolve([])
      }
    }
  }

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element
  }

  /**
   * Given the path to package.json, read all its dependencies
   */
  private getDepsInPackageJson(packageJsonPath: string): Dependency[] {
    if (this.pathExists(packageJsonPath)) {
      const toDep = (moduleName: string, version: string): Dependency => {
        const depPackageJsonPath = path.join(
          this.workspaceRoot ?? '',
          'node_modules',
          moduleName,
          'package.json'
        )

        let collapsibleState = vscode.TreeItemCollapsibleState.Collapsed
        if (this.pathExists(depPackageJsonPath)) {
          const depPackageJson = JSON.parse(fs.readFileSync(depPackageJsonPath, 'utf-8'))
          // 如果依赖的代码包已经安装（node_modules有内容），且这个安装包本身有dependencies或devDependencies，才设置为可展开的
          if (
            (!depPackageJson.dependencies ||
              Object.keys(depPackageJson.dependencies).length === 0) &&
            (!depPackageJson.devDependencies ||
              Object.keys(depPackageJson.devDependencies).length === 0)
          ) {
            collapsibleState = vscode.TreeItemCollapsibleState.None
          }
        }
        return new Dependency(moduleName, version, collapsibleState)
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
      const deps = packageJson.dependencies
        ? Object.keys(packageJson.dependencies).map(dep =>
            toDep(dep, packageJson.dependencies[dep])
          )
        : []
      const devDeps = packageJson.devDependencies
        ? Object.keys(packageJson.devDependencies).map(dep =>
            toDep(dep, packageJson.devDependencies[dep])
          )
        : []
      return deps.concat(devDeps)
    } else {
      return []
    }
  }

  private pathExists(pathLike: string): boolean {
    try {
      fs.accessSync(pathLike)
    } catch (error) {
      return false
    }

    return true
  }
}

export { DepNodeProvider }
