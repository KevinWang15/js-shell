// util function: read file (if last x lines is specified, then use `tail`, otherwise use `cat`)
module.exports = sh => (path, {last = null} = {}) => {
  if (last) {
    return sh("tail -" + last + " " + path);
  } else {
    return sh("cat " + path);
  }
};