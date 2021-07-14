#!/usr/bin/env node

const tsNode = require("ts-node/dist/bin");
const path = require("path");

(async () => {
  const argv = process.argv.slice(2);
  console.log(argv)
  const dir = path.join(__dirname, "../src");
  tsNode.main(["index.ts", ...argv], { "--dir": dir });
})();
