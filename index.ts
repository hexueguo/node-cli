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
    const webProject = new WebProject(name, cwd);
    webProject.init();
    // console.log("project",webProject)
    // writePackage(folderName, project.getPackage());
    await build(webProject);
    proce.succeed("succeed done!");
  });

program.parse(process.argv);
