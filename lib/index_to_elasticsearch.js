var _ = require('lodash');
var Promise = require('bluebird');
var client = require('./elasticsearch');
var moment = require('moment');
module.exports = function (data) {
  var bodies = _.flatten([data]);
  return Promise.each(bodies, function (body) {
    var date = moment.utc(body['@timestamp']);
    var options = {
      index: body._index || 'octojefe',
      type: body._type,
      body: body,
      requestTimeout: 2500,
      replication: 'async'
    };
    if (body._id) {
      options.id = body._id;
    }
    else if (body.id) {
      options.id = body._type + ':' + body.id;
    }
    if (body._id) delete body._id;
    if (body._type) delete body._type;
    if (body._index) delete body._index;
    return client.index(options).then(function (results) {
      return body;
    });
  });
};
