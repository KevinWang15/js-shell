module.exports = (sh, ptyProcess) => ({
  ssh: require("./ssh")(sh, ptyProcess),
  readFile: require("./readFile")(sh, ptyProcess),
  exit: require("./exit")(sh, ptyProcess),
  destroy: require("./destroy")(sh, ptyProcess),
});