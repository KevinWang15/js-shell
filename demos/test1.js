const sshRoutine = require("../index");

sshRoutine(async sh => {
  await sh("echo Hello World");
  await sh("cd /");
  await sh("pwd");
});
