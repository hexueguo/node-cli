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
