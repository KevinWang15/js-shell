// kill the pty process
module.exports = (sh, ptyProcess) => ({commandFinishIndicator = "closed"} = {}) => {
  ptyProcess.kill();
};