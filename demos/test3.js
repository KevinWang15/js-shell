const jsShell = require("../index");

jsShell(async sh => {
  let output = await sh.captureOutput(`whoami`);
  console.log(output);
});