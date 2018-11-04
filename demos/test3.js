const sshRoutine = require("../index");

sshRoutine(async sh => {
  let output = await sh.captureOutput(`whoami`);
  console.log(output);
});