const jsShell = require("../index");

jsShell(async sh => {
  await sh("echo Hello World");
  await sh("cd /");
  await sh("pwd");
});
