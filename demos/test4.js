const sshRoutine = require("../index");

sshRoutine(async sh => {
  await sh.login("1.2.3.4", {username: "root", password: "123456"});
  await sh(`hostname`);
});