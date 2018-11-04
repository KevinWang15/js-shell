module.exports = function defer() {
  let deferred = {};
  deferred.promise = new Promise(function (resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  }.bind(this));
  return deferred;
};