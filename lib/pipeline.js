var _ = require('lodash');
var Promise = require('bluebird');
var generateChain = require('./generate_chain');

var pipeline = [
  require('./index_to_elasticsearch')
];

var create = function (pipeline) {
  var noop = function (body) {
    return Promise.resolve(body);
  };
  return _.reduceRight(pipeline, function (memo, pipe) {
    var chain = generateChain(pipe);
    return chain(memo);
  }, noop);

};

module.exports = function (body) {
  var run = create(pipeline);
  return run(body);
};

module.exports.create = create;
