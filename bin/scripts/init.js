const fs = require("fs-extra");
const chalk = require("chalk");
const inquirer = require("inquirer");
const path = require("path");
const log = console.log;

async function init(name, options) {
  const cwd = options.cwd || process.cwd();
  const filePath = path.resolve(cwd, "apload.config.json");
  const gitignoreFilePath = path.resolve(cwd, ".gitignore");

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
  ];

  let reslut = await inquirer.prompt(promptList);

  try {
    await fs.writeFile(filePath, JSON.stringify(reslut));
    const hasGitFile = fs.existsSync(gitignoreFilePath);
    log(chalk.yellow("🖐 初始化配置文件完成"));
    if (!hasGitFile) return;
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
