#!/usr/bin/env node

const { program } = require("commander");
const package = require("../package.json");
program.version(package.version);

program
  .command("init")
  .description("Initialize the configuration file")
  .option("-c,--cover")
  .action((name, options) => {
    require("./scripts/init")(name, options);
  });

program
  .command("upload")
  .description("upload a file")
  .option("-c,--config <config>")
  .option("-d,--dist <dist>")
  .action((name, options) => {
    require("./scripts/upload")(name, options);
  });

program.parse(process.argv);
