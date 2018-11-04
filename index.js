const sleep = require("./utils/sleep");
const makeShell = require("./core/makeShell");


const startRoutine = async function (callback, delay = 0) {
  if (delay) {
    await sleep(delay);
  }
  let shell = await makeShell();
  let value = await callback(shell);
  shell.destroy();
  return value;
};

module.exports = startRoutine;