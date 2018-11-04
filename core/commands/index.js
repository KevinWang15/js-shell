module.exports = (sh, ptyProcess) => ({
  login: require("./login")(sh, ptyProcess),
  readFile: require("./readFile")(sh, ptyProcess),
  exit: require("./exit")(sh, ptyProcess),
  destroy: require("./destroy")(sh, ptyProcess),
});