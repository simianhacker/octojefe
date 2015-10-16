var request = require('./github_request');
var _ = require('lodash');
var parseLinkHeader = require('./parse_link_header');
var pipeline = require('./pipeline');
var Promise = require('bluebird');
var client = require('./elasticsearch');

function requestAllAndIndex(options, repo) {
  var repoSm =  _.pick(repo, 'id', 'name', 'full_name');
  return request(options).then(function (data) {
    if (_.isArray(data.body)) {
      return Promise.each(data.body, function (user) {
        user.repos = [ repoSm ];
        return client.get({ index: 'octojefe', type: 'user', id: user.id })
          .then(function (resp) {
            user = resp._source;
            if (_.isArray(doc.repos) && !_.find(doc.repos, { id: repo.id }))
              user.repos.push(repoSm)
            else user.repos = [ repoSm ]
            user._type = 'user';
            return pipeline(user);
          })
          .catch(function (err) {
            user._type = 'user'
            return pipeline(user);
          });
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
  console.log('Indexing collaborators for %s', repo.full_name);
  var options = {
    uri: repo.collaborators_url,
    qs: { state: 'all', per_page: 100 },
    json: true
  };
  return requestAllAndIndex(options, repo);
};

