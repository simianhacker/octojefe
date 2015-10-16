module.exports = function (fn) {
  return function (next) {
    return function (body) {
      return fn(body).then(next);
    };
  };
};
