// util function: exit shell (used to logout from another server)
module.exports = sh => ({commandFinishIndicator = "closed"} = {}) => {
  return sh("exit", {commandFinishIndicator});
};