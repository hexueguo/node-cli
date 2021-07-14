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
