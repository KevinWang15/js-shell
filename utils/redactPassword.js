module.exports = function redactPassword(pwd) {
  if (pwd.length < 4) {
    return new Array(pwd.length + 1).join("*");
  }
  return pwd.substr(0, 2) + new Array(pwd.length + 1 - 4).join("*") + pwd.substr(pwd.length - 2);
};