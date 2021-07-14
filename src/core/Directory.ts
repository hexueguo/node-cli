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
    let dir = this.getDirectory(directoryName);
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
