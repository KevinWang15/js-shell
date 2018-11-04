// util function: exit ssh (used to logout from another server)
module.exports = sh => ({commandFinishIndicator = "closed"} = {}) => {
  return sh("exit", {commandFinishIndicator});
};