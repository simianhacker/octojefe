var request = require('./github_request');
var _ = require('lodash');
var url = require('url');
var parseLinkHeader = require('./parse_link_header');
var pipeline = require('./pipeline');
var Promise = require('bluebird');

function requestAll(options, results) {
  results = results || [];
  return request(options)
    .then(function (data) {
      if (_.isArray(data.body)) {
        results = results.concat(data.body);
        var links;
        var params;
        if (data.response.headers.link) {
          links = parseLinkHeader(data.response.headers.link);
          if(links && links.next) {
            params = { uri: links.next, json: true };
            return requestAll(params, results);
          }
        }
      }
      return results;
    });
}

module.exports = function () {
  var options = {
    uri: '/orgs/elastic/repos',
    qs: { per_page: 100 },
    json: true
  };
  return requestAll(options)
    .then(function (data) {
      return Promise.each(data, function (repo) {
        repo._type = 'repository';
        if (repo && repo.name) return pipeline(repo);
      })
      .then(function () {
        return data;
      });
    });
}
