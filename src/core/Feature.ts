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
