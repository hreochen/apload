const fs = require("fs-extra");
const chalk = require("chalk");
const inquirer = require("inquirer");
const path = require("path");
const log = console.log;

async function init(name, options) {
  const cwd = options.cwd || process.cwd();
  const filePath = name.output
    ? path.resolve(cwd, name.output, "apload.config.json")
    : path.resolve(cwd, "apload.config.json");
  const gitignoreFilePath = path.resolve(cwd, ".gitignore");

  try {
    const isHasConfig = fs.existsSync(filePath);
    if (isHasConfig && !name.cover) {
      log(chalk.yellow("🖐 本地已有配置文件"));
      process.exit(0);
    }
  } catch (error) {
    console.log(error);
  }

  const promptList = [
    {
      type: "input",
      message: "输入服务器地址:",
      name: "host",
      validate: function (val) {
        if (val) {
          return true;
        }
        return "请输入服务器地址";
      },
    },
    {
      type: "input",
      message: "服务器路径",
      name: "cwd",
      default: "/home/",
    },
    {
      type: "number",
      message: "输入端口:",
      name: "port",
      default: "22",
    },
    {
      type: "input",
      message: "输入用户名:",
      name: "username",
      validate: function (val) {
        if (val) {
          return true;
        }
        return "请输入用户名";
      },
    },
    {
      type: "password",
      message: "输入密码:",
      name: "password",
      validate: function (val) {
        if (val) {
          return true;
        }
        return "请输入密码";
      },
    },
    {
      type: "confirm",
      message: "是否将配置文件追加到gitignore:",
      name: "isAddGigignore",
      default: false,
    },
  ];

  let reslut = await inquirer.prompt(promptList);

  try {
    const { isAddGigignore, ...configField } = reslut;
    await fs.writeFile(filePath, JSON.stringify(configField));
    const hasGitFile = fs.existsSync(gitignoreFilePath);
    log(chalk.yellow("🖐 初始化配置文件完成"));
    if (!hasGitFile || !isAddGigignore) return;
    await fs.appendFile(gitignoreFilePath, "\napload.config.json");
  } catch (error) {
    log(chalk.red("❌ 初始化配置文件失败"));
  }
}

module.exports = (...args) => {
  return init(...args).catch((err) => {
    console.log("err", err);
  });
};
