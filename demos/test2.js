const sshRoutine = require("../index");

sshRoutine(async sh => {
  for (let i = 0; i < 10; i++) {
    await sh(`echo Hello World ${i}`);
  }
});