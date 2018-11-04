const chalk = require("chalk");
const redactPassword = require("../../utils/redactPassword");

// util function: login to another host
module.exports = sh => async (host, {username = null, password = null, port = null, commandFinishIndicator = "ogin"} = {}) => {
  let cmd = "";

  cmd += "ssh ";

  if (username) {
    cmd += username + "@";
  }

  cmd += host;

  if (port) {
    cmd += " -p " + port;
  }

  if (password) {
    await sh(cmd, {commandFinishIndicator: "assword"});
    return await sh(password, {
      commandFinishIndicator,
      overrideLogMessage: (command) => "🔑 " + chalk.gray(redactPassword(command))
    });
  } else {
    return await sh(cmd, {commandFinishIndicator});
  }
};