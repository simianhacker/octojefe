var _ = require('lodash');
var config = require('../.config.json');
var request = require('request');
var Promise = require('bluebird');
var baseUrl = 'https://api.github.com/';
var username = config.github.username;
var password = config.github.password;
var auth = (new Buffer(username + ':' + password).toString('base64'));
module.exports = function (options) {
  if (/^http/.test(options.uri)) {
    options.uri = options.uri.replace(baseUrl, '');
  }
  if (/\{.+\}/.test(options.uri)) {
    options.uri = options.uri.replace(/\{.+\}/, '');
  }
  options = _.defaultsDeep(options, {
    baseUrl: baseUrl,
    headers: {
      'User-Agent': 'Octojefe Indexer 1.0',
      Authorization: 'Basic ' + auth
    }
  });
  return new Promise(function (resolve, reject) {
    request(options, function (err, resp, body) {
      if (err) return reject(err);
      resolve({ response: resp, body: body });
    });
  });
}
