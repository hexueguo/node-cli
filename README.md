# 前端脚手架搭建分享

---

## 最近团队需要统一脚手架，花了点时间了解了一下如何去进行搭建其实原理并不复杂，

### 第一步，首先我们要知道需要哪些东西，然后我们要创建什么东西

1. 我们首先需要一个可被 node 执行入口文件

2. 需要生成文件的模板

3. 使用 node fs 模块把模板写入我们指定的目录

> 这是最简单的思路，那么我们就可以动手了

1. 首先创建一个文件夹，然后在文件夹执行 npm init 初始化一个 package.json 文件

2. 然后创建一个入口文件 index.js，然后写入

   ```
   #!/usr/bin/env node

   console.log('hello,cli!');
   ```

   这时候执行 node index.js 就能够在控制台打印 hello,cil!

3. 再创建一个模板文件 template.js, 添加字符串

   ```
   hello,template!
   ```

4. 然后我们在 index.js 进行修改，通过 process.cwd()获取 node 当前执行路径，我们可以读取一个文件，并写入到一个目录下

   ```
   #!/usr/bin/env node

   console.log('hello,cli!');

   const fs = require("fs");
   const path = require("path");

   const folderName = path.join(process.cwd(), "/cli");

   // 判断文件夹是否存在
   const mkdirFile = (name) => {
   try {
       if (!fs.existsSync(name)) {
       fs.mkdirSync(name);
       }
   } catch (err) {
       console.error(err);
   }
   };

   fs.readFile("./template.js", "utf-8", (err, data) => {
   if (err) {
       console.log(err);
       return;
   } else {
       console.log(data);
       mkdirFile(folderName);
       fs.writeFileSync(`${folderName}/template.js`, data);
   }
   });

   ```

5. 第一步基础就完成了。下面我们进行思考

   > 如何在创建脚手架时，需要在控制台进行交互，这时候需要引入安装第三方库

   - commander 可以自动的解析命令和参数，用于处理用户输入的命令
   - inquirer 用户输入/选择交互
   - ora 控制台进度动画提示

   好了，这时候我们修改 index.js，执行 node index.js 就会提示，使用 create 参数，执行 node index.js create 项目名，然后进入项目类型选择，选择完成，就会创建对应名称的项目文件夹，并在里面创建 template.js

```
#!/usr/bin/env node

// console.log("hello,cli!");

const fs = require("fs");
const path = require("path");
const ora = require("ora");
const inquirer = require("inquirer");
const program = require("commander");

// 判断文件夹是否存在
const mkdirFile = (name) => {
  try {
    if (!fs.existsSync(name)) {
      fs.mkdirSync(name);
    }
  } catch (err) {
    console.error(err);
  }
};

const doFs = (name) => {
  fs.readFile("./template.js", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
      return;
    } else {
      mkdirFile(name);
      fs.writeFileSync(`${name}/template.js`, data);
    }
  });
};

program
  //   .version('1.0.0')
  .command("create <app-name>")
  .description("create a new project")
  .action(async (name) => {
    const cwd = process.cwd();

    const questions = [
      {
        type: "list",
        message: "请选择项目类型: ",
        name: "type",
        choices: [{ name: "web项目", value: "web" }],
      },
    ];
    const { type } = await inquirer.prompt(questions);

    const proce = ora("Start creating...");
    proce.start();
    const folderName = path.join(cwd, name);
    doFs(folderName);
    proce.succeed("succeed done!");
  });

program.parse(process.argv);

```

### 那么到此，我们的基本思路已经完成，我们需要重新整理一下。

- 首先，我们创建一个 bin 文件夹，添加 tara.js 文件，作为我们的入口，在其中引入 index.js

- 创建一个 src 文件夹，里面存放我们所有的源码，添加 src/core 文件夹

- 因为后续的模板定义，类定义会用到，我们需要可直接执行 ts 文件，所以需要添加一个第三方组件，npm i -S ts-node @types/node，具体使用可以参照官方文档，然后将 tara.js 改造

```
#!/usr/bin/env node

const tsNode = require("ts-node/dist/bin");
const path = require("path");

(async () => {
    const argv = process.argv.slice(2);
    const dir = path.join(__dirname, "../src");
    tsNode.main(["index.ts", ...argv], { "--dir": dir });
})();

```

- 修改 index.js 为 index.ts，并给所有方法参数添加类型定义，然后直接执行 node bin/tara，这时候会抛 Cannot find module 'typescript'错误，需要安装 ts 库 npm i -S typescript

- 这时候我们也可以使用远程模板 download-git-repo 支持从 Github 下载仓库，详细了解可以参考官方文档。

```
npm install --save download-git-repo
```

download() 第一个参数就是仓库地址,详细了解可以看官方文档

- 使用本地模板，那我们的思路是，可以生成一个统一的模板配置对象，然后根据配置，一个一个的生成文件，从而生成完整的项目目录

  - 那第一步就是先创建一个模板类 Project.ts，定义生成 package.json 文件的属性

    > *init*方法是一个抽象方法，用于子类进行自定义一些操作

  ```
      import Package from "./Package";

      abstract class Project {
          name: string;
          private package: Package;

          constructor(parameters) {}


          init() {}

          protected abstract _init_(): void;
      }

      export default Project;
  ```

  - 创建一个 Package 类

  ```
  class Package {
      constructor(parameters) {}
  }

  export default Package;
  ```

- 下一步我们就是给 Package 添加属性和方法，name、version、scripts、dependencies、devDependencies 等等，并添加 get/set 方法，KeyValue 为一个通用的对象接口
  KeyValue {
  [T: string]: any;
  }

```
import { KeyValue } from "./Interface";

const INIT_VERSION = "0.1.0";
const MIT = "MIT";

function pick(object: KeyValue, props: string[]): KeyValue {
  const result: KeyValue = {};
  props.forEach((prop) => {
    if (object[prop] !== undefined) {
      result[prop] = object[prop];
    }
  });
  return result;
}

function toJSON(map: Map<string, string>): KeyValue {
  const json: KeyValue = {};
  const keys: string[] = Array.from(map.keys());
  keys.sort();
  keys.forEach((key) => {
    json[key] = map.get(key) || "";
  });
  return json;
}

class Package {
  [x: string]: any;
  private name: string;
  private version: string = INIT_VERSION;
  private license: string = MIT;
  private scripts: Map<string, string> = new Map();
  private dependencies: Map<string, string> = new Map();
  private devDependencies: Map<string, string> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  addExtra(key: string, value: string | string[] | KeyValue) {
    this[key] = value;
  }

  addScript(name: string, script: string) {
    this.scripts.set(name, script);
  }

  addDependency(name: string, version: string) {
    this.dependencies.set(name, version);
  }

  addDependencies(dependencies: { [K: string]: string }) {
    Object.keys(dependencies).forEach((key) => {
      this.addDependency(key, dependencies[key]);
    });
  }

  addDevDependency(name: string, version: string) {
    this.devDependencies.set(name, version);
  }

  addDevDependencies(dependencies: KeyValue) {
    Object.keys(dependencies).forEach((key) => {
      this.addDevDependency(key, dependencies[key]);
    });
  }

  toJSON(): KeyValue {
    const pkg: KeyValue = pick(this, [
      "name",
      "private",
      "version",
      "license",
      "main",
      "bin",
      "files",
      "lint-staged",
    ]);

    if (this.scripts.size !== 0) {
      pkg.scripts = toJSON(this.scripts);
    }

    if (this.dependencies.size !== 0) {
      pkg.dependencies = toJSON(this.dependencies);
    }

    if (this.devDependencies.size !== 0) {
      pkg.devDependencies = toJSON(this.devDependencies);
    }

    return pkg;
  }
}

export default Package;

```

然后改造 Project.ts，这样子初始化一个 Project 时，就将 Package 的配置也初始化了，并在 Project 中暴露 Package 的操作方法

```
import Package from "./Package";
import { KeyValue } from "./Interface";

abstract class Project {
  name: string;

  private package: Package;
  // 一些标识
  private flags: { [K: string]: boolean } = {};

  constructor(name: string, dir: string) {
    this.name = name;
    this.package = new Package(name);
  }

  init() {
    this._init_();
  }

  protected abstract _init_(): void;

  setFlag(flag: string) {
    this.flags[flag] = true;
  }

  isFalg(flag: string): boolean {
    return this.flags[flag];
  }

  attachPackage(key: string, value: string | string[] | KeyValue) {
    this.package.addExtra(key, value);
  }

  addScript(name: string, script: string) {
    this.package.addScript(name, script);
  }

  addDependency(name: string, version: string) {
    this.package.addDependency(name, version);
  }

  addDependencies(dependencies: { [K: string]: string }) {
    Object.keys(dependencies).forEach((key) => {
      this.package.addDependency(key, dependencies[key]);
    });
  }

  addDevDependency(name: string, version: string) {
    this.package.addDevDependency(name, version);
  }

  addDevDependencies(dependencies: KeyValue) {
    Object.keys(dependencies).forEach((key) => {
      this.package.addDevDependency(key, dependencies[key]);
    });
  }

  getPackage(): Package {
    return this.package;
  }
}

export default Project;


```

- 我们可以新建一个 WebProject，继承 Project，然后在*init*方法中添加几个依赖，然后修改 index.ts，我们就可以初步创建一个我们需要的 package.josn

> WebProject.ts

```
import Project from "../core/Project";

class WebProject extends Project {
  _init_() {
    this.addDependencies({
      "@types/node": "^15.12.5",
      commander: "^8.0.0",
      inquirer: "^8.1.1",
      ora: "^5.4.1",
      "ts-node": "^10.0.0",
      typescript: "^4.3.5",
    });
  }
}

export default WebProject;


```

> index.ts

需要安装新的一个 fs 依赖
npm i -S fs-extra @types/fs-extra

```
#!/usr/bin/env node

import WebProject from "./src/projects/WebProject";
import * as fs from "fs-extra";
import Package from "./src/core/Package";
const path = require("path");
const ora = require("ora");
const inquirer = require("inquirer");
const program = require("commander");

// 判断文件夹是否存在
// const mkdirFile = (name: string) => {
//   try {
//     if (!fs.existsSync(name)) {
//       fs.mkdirSync(name);
//     }
//   } catch (err) {
//     console.error(err);
//   }
// };

// const doFs = (name: string) => {
//   fs.readFile("./template.js", "utf-8", (err: any, data: any) => {
//     if (err) {
//       console.log(err);
//       return;
//     } else {
//       mkdirFile(name);
//       fs.writeFileSync(`${name}/template.js`, data);
//     }
//   });
// };

const writePackage = (folderName: string, data: Package) => {
  // mkdirFile(name);
  fs.ensureDir(folderName);
  const file = path.join(folderName, "package.json");
  fs.ensureFile(file);
  fs.writeFile(file, JSON.stringify(data, null, 2));
};

program
  //   .version('1.0.0')
  .command("create <app-name>")
  .description("create a new project")
  .action(async (name: string) => {
    const cwd = process.cwd();

    const questions = [
      {
        type: "list",
        message: "请选择项目类型: ",
        name: "type",
        choices: [{ name: "web项目", value: "web" }],
      },
    ];
    const { type } = await inquirer.prompt(questions);

    const proce = ora("Start creating...");
    proce.start();
    const folderName = path.join(cwd, name);
    const fileName = path.join(folderName, "package.json");
    // doFs(folderName);
    const project = new WebProject(name, cwd);
    project.init();
    writePackage(folderName, project.getPackage());
    proce.succeed("succeed done!");
  });

program.parse(process.argv);

```

- 然后执行 node bin/tara create myapp 就会生成一个 myapp 文件夹，然后生成 package.json,这样子可以在 Project 中可以自由的往 package.json 中添加各种属性和配置

```
 {
   "name": "myapp",
   "version": "0.1.0",
   "license": "MIT",
   "dependencies": {
     "@types/node": "^15.12.5",
     "commander": "^8.0.0",
     "inquirer": "^8.1.1",
     "ora": "^5.4.1",
     "ts-node": "^10.0.0",
     "typescript": "^4.3.5"
   }
 }
```

### 现在我们需要思考如何生成除 package.json 以外的其他文件，思路就是存储一个树结构对象，第一层存根目录文件名，下一层存储它的字文件夹/子文件，然后子文件夹再存储下一层子文件夹/子文件，一直这样直到所有文件被记录，然后我们按照这个存储结构，一层一层的创建文件夹/文件，并将模板字符写入文件中

- 那第一步我们就修改 Project.ts，添加一个 dirTree,它的类型我们定义一个 Directory 目录类，其实方法也是比较简单:

  1、addFile 就是 Directory 对象中添加文件，以及文件对应的模板字符串
  2、addDirectory 就是在当前目录下再添加一个文件夹
  3、addByPath 就是根据文件夹路径，依次创建完成，得到一个多层的 Directory 对象，其中 this 是初始值

```
import { KeyValue } from "./Interface";

class Directory {
 name: string;
 // 第一个文件名，第二个为模板字符串或返回字符串的Promise方法
 files: Map<string, string | (() => Promise<string>)> = new Map();
 // 子节点
 children: Directory[] = [];

 constructor(name: string) {
   this.name = name;
 }

 addFile(name: string, content: string | (() => Promise<string>) = "") {
   this.files.set(name, content);
 }
 addFiles(KeyValue: KeyValue) {
   Object.keys(KeyValue).forEach((key) => {
     this.addFile(key, KeyValue[key]);
   });
 }

 addDirectory(directoryName: string): Directory {
   let dir = this.getDirectory(directoryName);// 判断当前文件夹下是否已存在
   if (dir) {
     return dir;
   }
   dir = new Directory(directoryName);
   this.children.push(dir);
   return dir;
 }

 addDirectories(directorys: string[]) {
   directorys.forEach((directory) => {
     this.addDirectory(directory);
   });
 }

 getDirectory(name: string): Directory | undefined {
   return this.children.find((dir) => dir.name === name);
 }

 addByPath(path: string): Directory {
   const parts = path.split("/");
   return parts.reduce<Directory>((dir, name) => dir.addDirectory(name), this);
 }

 getByPath(path: string): Directory | null | undefined {
   const parts = path.split("/");
   return parts.reduce<Directory | null>((dir, name) => {
     if (dir) {
       const child = dir.getDirectory(name);
       if (child) {
         return child;
       }
     }
     return null;
   }, this);
 }
}

export default Directory;

```

- 这时候我们就可以继续该着 Project.ts，添加和修改对应的方法、属性

```
......
import * as path from "path";
import Directory from "./Directory";

abstract class Project {
 dirTree: Directory;

 constructor(name: string, dir: string) {
   this.name = name;
   this.dirTree = new Directory(path.resolve(dir, name));
   this.package = new Package(name);
 }

 ......

 addFile(
   fileName: string,
   content: string | (() => Promise<string>),
   path?: string
 ) {
   if (path) {
     const dir = this.dirTree.addByPath(path);
     dir.addFile(fileName, content);
   } else {
     this.dirTree.addFile(fileName, content);
   }
 }

 addDirectory(path: string): void {
   this.dirTree.addByPath(path);
 }

 addDirectories(dirs: string[]) {
   dirs.forEach((dir) => {
     this.addDirectory(dir);
   });
 }
}

export default Project;

```

- 那么接下来就是如何使用 Directory 类来完成目录类对象的初始化，这时候我们可以思考一下如果我们把模板和目录类的配置都放到 Project 中来做，既会让 Project 类代码很多，也会更复杂。那么我们可以做一个统一的类，将 Project 对象传参进去，来配置 Project 中的所有属性配置，然后在 Project 中添加一个属性包含这个类的对象，那么这样子就可以简化 Project，因为我们只要知道这个。我们创建一个 Feature.ts 类，实现 Project 的绝大部分方法

```

import * as fs from "fs-extra";
import Project from "./Project";
import { KeyValue } from "./Interface";

abstract class Feature {
  abstract name: string;

  protected project: Project;

  constructor(project: Project) {
    this.project = project;
  }

  // 所有feacture必须实现自己的__init方法
  protected abstract _init_(): void;

  public init(): void {
    this._init_();
  }

  addFile(
    name: string,
    filePath: string | (() => Promise<string>) = "",
    path?: string
  ) {
    if (typeof filePath === "string") {
      try {
        this.project.addFile(name, fs.readFileSync(filePath, "utf-8"), path);
      } catch (error) {
        this.project.addFile(name, filePath, path);
      }
    } else {
      this.project.addFile(name, filePath, path);
    }
  }

  addScript(name: string, script: string) {
    this.project.addScript(name, script);
  }

  addScripts(keyValue: KeyValue): void {
    Object.keys(keyValue).forEach((it) => {
      this.addScript(it, keyValue[it]);
    });
  }

  addDependency(name: string, version: string) {
    this.project.addDependency(name, version);
  }

  addDependencies(dependencies: { [K: string]: string }) {
    this.project.addDependencies(dependencies);
  }

  addDevDependency(name: string, version: string) {
    this.project.addDevDependency(name, version);
  }

  addDevDependencies(dependencies: KeyValue) {
    this.project.addDevDependencies(dependencies);
  }
}

export default Feature;

```

- 那么再修改一下 Project.ts，增加如下代码

```
......
import Feature from "./Feature";

abstract class Project {
  ......
  private features: Feature[] = [];

  ......

  init() {
    this._init_();
    this.features.forEach((feature) => feature.init());
  }

  ......

  hasFeature(pattern: string): boolean {
    return !!this.features.find((f) => f.name === pattern);
  }

  addFeature(feature: Feature): void {
    if (this.hasFeature(feature.name)) {
      return;
    }
    this.features.push(feature);
  }
}

export default Project;

```

- 这时候我们就可以配置我们的模板了

1.  新建一个模板文件夹 src/core/features
2.  新建一个 VueFeature.ts
3.  自己可以初始化一个建单的 vue 项目，然后把其中的 main.js、App.vue、index.html、index.js、Home.vue 拷贝到 template 文件夹中

```
import Feature from "../Feature";
import path from "path";

class VueFeature extends Feature {
  name = "VueFeature";

  protected _init_(): void {
    this.initScript();
    this.initTemplate();
    this.initDependencies();
    this.initDevDependencies();
  }

  initScript() {
    this.addScripts({
      start: "vue-cli-service serve",
      serve: "vue-cli-service serve",
      build: "vue-cli-service build",
      lint: "vue-cli-service lint",
    });
    this.addScript("build:staging", "vue-cli-service build --mode staging");
    this.addScript("build:dev", "vue-cli-service build --mode development");
  }

  initTemplate() {
    this.addFile("main.js", path.join(__dirname, "./template/main.js"), "src");
    this.addFile("App.vue", path.join(__dirname, "./template/App.vue"), "src");
    this.addFile(
      "index.html",
      path.join(__dirname, "./template/index.html"),
      "public"
    );
    this.addFile(
      `index.js`,
      path.join(__dirname, "./template/router.js"),
      "src/router"
    );
    this.addFile(
      "Home.vue",
      path.join(__dirname, "./template/Home.vue"),
      "src/views"
    );
  }

  initDependencies() {
    this.addDependencies({
      "core-js": "^3.6.5",
      vue: "^3.0.0",
      "vue-router": "^4.0.0-0",
      vuex: "^4.0.0-0",
    });
  }

  initDevDependencies() {
    // this.addDevDependency("", "");
    this.addDevDependencies({
      "@vue/cli-plugin-babel": "~4.5.0",
      "@vue/cli-plugin-eslint": "~4.5.0",
      "@vue/cli-service": "~4.5.0",
      "@vue/compiler-sfc": "^3.0.0",
      "@vue/eslint-config-prettier": "^6.0.0",
      "babel-eslint": "^10.1.0",
      eslint: "^6.7.2",
      "eslint-plugin-prettier": "^3.3.1",
      "eslint-plugin-vue": "^7.0.0",
      prettier: "^2.2.1",
    });
  }
}

export default VueFeature;

```

- 修改 Project.ts 在 init 方法最前面添加 VueFeature

```

import VueFeature from "./features/VueFeature";

.......

init() {
    this.addFeature(new VueFeature(this));
    this._init_();
    this.features.forEach((feature) => feature.init());
  }

......

```

- 这时候可以执行 node bin/tara create myapp，打印 project，得到了我们需要的 Project 对象

```
请选择项目类型:  web项目
⠋ Start creating...
  project <ref *1> WebProject {
  features: [ VueFeature { project: [Circular *1], name: 'VueFeature' } ],
  flags: {},
  name: 'myapp',
  dirTree: Directory {
    files: Map(0) {},
    children: [ [Directory], [Directory] ],
    name: '/usr/webapp/cli-test/myapp'
  },
  package: Package {
    version: '0.1.0',
    license: 'MIT',
    scripts: Map(6) {
      'start' => 'vue-cli-service serve',
      'serve' => 'vue-cli-service serve',
      'build' => 'vue-cli-service build',
      'lint' => 'vue-cli-service lint',
      'build:staging' => 'vue-cli-service build --mode staging',
      'build:dev' => 'vue-cli-service build --mode development'
    },
    dependencies: Map(10) {
      '@types/node' => '^15.12.5',
      'commander' => '^8.0.0',
      'inquirer' => '^8.1.1',
      'ora' => '^5.4.1',
      'ts-node' => '^10.0.0',
      'typescript' => '^4.3.5',
      'core-js' => '^3.6.5',
      'vue' => '^3.0.0',
      'vue-router' => '^4.0.0-0',
      'vuex' => '^4.0.0-0'
    },
    devDependencies: Map(10) {
      '@vue/cli-plugin-babel' => '~4.5.0',
      '@vue/cli-plugin-eslint' => '~4.5.0',
      '@vue/cli-service' => '~4.5.0',
      '@vue/compiler-sfc' => '^3.0.0',
      '@vue/eslint-config-prettier' => '^6.0.0',
      'babel-eslint' => '^10.1.0',
      'eslint' => '^6.7.2',
      'eslint-plugin-prettier' => '^3.3.1',
      'eslint-plugin-vue' => '^7.0.0',
      'prettier' => '^2.2.1'
    },
    name: 'myapp'
  }
}
✔ succeed done!

```

- 下一步就是我们把模板生成出来了
  创建 build.ts
  安装依赖 npm i -S mkdirp ejs @types/ejs

```
const path = require("path");
const mkdirp = require("mkdirp");
import Package from "./Package";
import Project from "./Project";
import Directory from "./Directory";
import * as ejs from "ejs";
import * as fs from "fs-extra";

function pipeAsyncFunctions(
    ...fns: ((arg: any) => any)[]
  ): (arg: any) => Promise<any> {
    return (arg: any) => fns.reduce((p, f) => p.then(f), Promise.resolve(arg));
  }

async function renderFile(file: string, template: string, project: Project) {
  const content: string = ejs.render(template, { project }, { async: false });
  await fs.writeFile(file, content);
}

async function createDirectory(
  current: Directory,
  project: Project,
  parent?: string
): Promise<void> {
  const dir = path.join(parent || "", current.name);
  await fs.ensureDir(dir);
  // log('创建目录: %s', dir)
  if (current.files.size !== 0) {
    const all = Array.from(current.files).map((item) => async () => {
      const file = path.join(dir, item[0]);
      // log("创建文件: %s", file);
      await fs.ensureFile(file);
      await renderFile(
        file,
        typeof item[1] === "string" ? item[1] : await item[1](),
        project
      );
    });
    await pipeAsyncFunctions(...all)(true);
  }
  if (current.children.length !== 0) {
    const all = current.children.map((child) => () =>
      createDirectory(child, project, dir)
    );
    await pipeAsyncFunctions(...all)(true);
  }
}

async function createPackage(dir: string, pkg: Package) {
  console.log("创建文件: package.json");
  const file = path.join(dir, "package.json");
  await fs.ensureFile(file);
  await fs.writeFile(file, JSON.stringify(pkg, null, 2));
}

async function createFolder(name: string) {
  const pwd = path.join(process.cwd(), name);
  mkdirp(pwd).then(() => {
    console.log("文件夹创建", pwd);
  });
}

async function build(project: Project): Promise<void> {
  await createFolder(project.name);
  await createDirectory(project.dirTree, project);
  await createPackage(project.dirTree.name, project.getPackage());
}

export default build ;

```

- 然后修改 index.js，将 project 对象传入 build 方法，执行，最后会生成如下结构
  - myapp
    - public
      - index.html
    - src
      - router
        - index.js
    - views
      - Home.vue
    - App.vue
    - main.js
    - package.json

```
#!/usr/bin/env node

import WebProject from "./src/projects/WebProject";
import * as fs from "fs-extra";
import Package from "./src/core/Package";
import build from './src/core/build'
// const fs = require("fs-extra");
const path = require("path");
const ora = require("ora");
const inquirer = require("inquirer");
const program = require("commander");

program
  //   .version('1.0.0')
  .command("create <app-name>")
  .description("create a new project")
  .action(async (name: string) => {
    const cwd = process.cwd();

    const questions = [
      {
        type: "list",
        message: "请选择项目类型: ",
        name: "type",
        choices: [{ name: "web项目", value: "web" }],
      },
    ];
    const { type } = await inquirer.prompt(questions);

    const proce = ora("Start creating...");
    proce.start();
    const folderName = path.join(cwd, name);
    const fileName = path.join(folderName, "package.json");
    // doFs(folderName);
    const webProject = new WebProject(name, cwd);
    webProject.init();
    // console.log("project",webProject)
    // writePackage(folderName, project.getPackage());
    await build(webProject);
    proce.succeed("succeed done!");
  });

program.parse(process.argv);

```

### 到此，我们用 node 生成一个我们配置的模板就可以完成了，我们还可以加入更多控制,如项目配置文件、是否支持 ts，模板文件中使用 ejs 进行条件判断、不同 vue 版本控制、不同模板选择生成

### 后续将优化，将项目上传到 npm，可以直接从 npm 安装并执行

### 具体项目代码，我放在 git 上，大家可以去拉取下来
[git地址](https://github.com/hexueguo/node-cli)
## 欢迎大家留言
