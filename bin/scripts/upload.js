const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { NodeSSH } = require("node-ssh");
const zipFile = require("compressing");
const shell = require("shelljs");
const ora = require("ora");

async function upload(name, options) {
  const cwd = options.cwd || process.cwd();
  const ssh = new NodeSSH();
  const filePath = name.config
    ? path.resolve(cwd, name.config)
    : path.resolve(cwd, "apload.config.json");
  const zipPath = path.resolve(cwd, "dist.zip");
  const willZipPath = name.dist
    ? path.resolve(cwd, name.dist)
    : path.resolve(cwd, "dist");
  const spinner = ora(`${chalk.yellow("🔍 查询文件中..")}`).start();

  try {
    const pathIsHas = fs.existsSync(willZipPath);
    if (pathIsHas) {
      await zipFile.zip.compressDir(
        path.resolve(cwd, willZipPath),
        path.resolve(cwd, "dist.zip")
      );
    } else {
      spinner.fail(chalk.red("文件路径不存在"));
      process.exit(0);
    }
  } catch (error) {
    console.log(error);
  }
  try {
    spinner.text = chalk.yellow("📖 读取文件中...");
    const fileContent = await fs.readFile(filePath, "utf-8");
    let result = JSON.parse(fileContent);
    spinner.text = chalk.yellow("🔗 远程连接中...");
    await ssh.connect(result);
    spinner.text = chalk.yellow("🚀 上传文件中...");
    await ssh.putFile(zipPath, `${result.cwd}dist.zip`);
    spinner.text = chalk.yellow("📃 解压中...");
    await ssh.execCommand("unzip -o dist.zip", { cwd: result.cwd });
    await ssh.execCommand("rm -f dist.zip", { cwd: result.cwd });
    shell.rm(zipPath);
    spinner.succeed("🖐 上传完成");
    process.exit(0);
  } catch (error) {
    shell.rm(zipPath);
    if (error.code === "ENOENT") {
      spinner.fail(chalk.red("配置文件不存在 先运行 👉 apload init"));
    }
    if (error.code === "ENOTFOUND") {
      spinner.fail(chalk.red("服务器连接失败"));
    }
    if (error.level === "client-authentication") {
      spinner.fail(chalk.red("远程认证失败"));
    }
  }
}

module.exports = (...args) => {
  return upload(...args).catch((err) => {
    console.log("err", err);
  });
};
