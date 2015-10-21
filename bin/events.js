#!/usr/bin/env node
var request = require('../lib/github_request');
var Promise = require('bluebird');
var pipeline = require('../lib/pipeline');
var client = require('../lib/elasticsearch');
var refreshInterval = 60;

function poll() {
  var start = Date.now();
  var options = {
    index: 'octojefe',
    type: 'repository',
    body: {
      size: 1000,
      fields: [
        'id',
        'full_name',
        'name',
        'issue_events_url'
        ]
    }
  };
  return client.search(options)
    .then(function (resp) {
      return Promise.each(resp.hits.hits, function (doc) {
        var params = { uri: doc.fields.issue_events_url[0], json: true };
        return request(params)
          .then(function (data) {
            if (data.response.headers['x-poll-interval']) {
              refreshInterval = parseInt(data.response.headers['x-poll-interval'], 10);
              console.log('Setting refreshInterval to ', refreshInterval);
            }
            return Promise.each(data.body, function (event) {
              event.repo = {
                id: doc.fields.id[0],
                name: doc.fields.name[0],
                full_name: doc.fields.full_name[0]
              };
              var options = {
                index: 'octojefe',
                type: 'event',
                body: event,
                id: 'event:' + event.id
              }
              return client.create(options)
                .then(function (resp) {
                  return event;
                })
                .catch(function (err) {
                  // basically ignore
                  return Promise.resolve();
                })
                .then(function (event) {
                  if (event) {
                    console.log('Updating event:' + event.id);
                    var body = event.issue;
                    body.repo = {
                      id: doc.fields.id[0],
                      name: doc.fields.name[0],
                      full_name: doc.fields.full_name[0]
                    };
                    var options = {
                      index: 'octojefe',
                      type: 'issue',
                      body: body,
                      id: 'issue:' + body.id
                    };
                    return client.index(options)
                  }
                })
            });
          });
      });
    })
    .catch(function (err) {
      console.log(err);
    })
    .finally(function () {
      console.log('Finished in %sms', Date.now()-start);
      setTimeout(poll, refreshInterval * 1000);
    });
}

poll();

