const sleep = require("./utils/sleep");
const makeShell = require("./core/makeShell");


const jsShell = async function (callback, {delay = 0, echoOff = false, shellRttDelay, defaultStdOutHandling = undefined} = {}) {
  if (delay) {
    await sleep(delay);
  }
  let shell = await makeShell({echoOff, shellRttDelay, defaultStdOutHandling});
  let value = await callback(shell);
  shell.destroy();
  return value;
};

module.exports = jsShell;