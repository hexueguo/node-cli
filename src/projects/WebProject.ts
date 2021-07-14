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
