#!/usr/bin/env node
var request = require('../lib/github_request');
var Promise = require('bluebird');
var pipeline = require('../lib/pipeline');
var indexRepos = require('../lib/index_repos');
var indexCollaborators = require('../lib/index_collaborators');
var indexIssues = require('../lib/index_issues');
var client = require('../lib/elasticsearch');
var octojefeTemplate = require('../octojefe-template.json');

client.indices.putTemplate({
  name: 'octojefe',
  body: octojefeTemplate
}).then(function () {
  return indexRepos()
})
.each(function (repo) {
  return Promise.each([
      indexIssues,
  ], function (fn) {
    return fn(repo);
  });
});
