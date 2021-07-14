import * as path from "path";
import Package from "./Package";
import { KeyValue } from "./Interface";
import Directory from "./Directory";
import Feature from "./Feature";
import VueFeature from "./features/VueFeature";

abstract class Project {
  name: string;

  private package: Package;
  dirTree: Directory;
  private features: Feature[] = [];
  // 一些标识
  private flags: { [K: string]: boolean } = {};

  constructor(name: string, dir: string) {
    this.name = name;
    this.dirTree = new Directory(path.resolve(dir, name));
    this.package = new Package(name);
  }

  protected abstract _init_(): void;

  init() {
    this.addFeature(new VueFeature(this));
    this._init_();
    this.features.forEach((feature) => feature.init());
  }

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
