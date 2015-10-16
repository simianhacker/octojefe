var request = require('./github_request');
var _ = require('lodash');
var parseLinkHeader = require('./parse_link_header');
var pipeline = require('./pipeline');
var Promise = require('bluebird');

function requestAllAndIndex(options, repo) {
  return request(options).then(function (data) {
    if (_.isArray(data.body)) {
      return Promise.each(data.body, function (issue) {
        issue.repo = _.pick(repo, 'id', 'name', 'full_name');
        issue._type = 'issue';
        return pipeline(issue);
      })
        .then(function () {
          if (data.response.headers.link) {
            links = parseLinkHeader(data.response.headers.link);
            if(links && links.next) {
              params = { uri: links.next, json: true };
              return requestAllAndIndex(params, repo);
            }
          }
        });
    }
  });
}

module.exports = function (repo) {
  console.log('Indexing issues for %s', repo.full_name);
  var options = {
    uri: repo.issues_url,
    qs: { state: 'all', per_page: 100 },
    json: true
  };
  return requestAllAndIndex(options, repo);
};
