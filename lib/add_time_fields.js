var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');
module.exports = function (data) {
  var bodies = _.flatten([data]);
  return Promise.each(bodies, function (body) {
    var date = body.timestamp;
    body['@timestamp'] = date;
    var timestamp = moment.utc(date);
    body.timeParts = {
      hour: timestamp.format('H'),
      minute: timestamp.format('m'),
      weekday: timestamp.format('dddd'),
      week: timestamp.format('W'),
      day: timestamp.format('D'),
      month: timestamp.format('MMMM'),
      year: timestamp.format('YYYY'),
      quarter: timestamp.format('Q'),
      weekYear: timestamp.format('GGGG')
    };
    if (body.tzOffset) {
      var offset = moment.utc().utcOffset(data.tzOffset)
      var local = timestamp.clone().add(offset, 'minutes');
      body.localTimeParts = {
        hour: local.format('H'),
        minute: local.format('m'),
        weekday: local.format('dddd'),
        week: local.format('W'),
        day: local.format('D'),
        month: local.format('MMMM'),
        year: local.format('YYYY'),
        quarter: local.format('Q'),
        weekYear: local.format('GGGG')
      };
    }
    return Promise.resolve(body);
  });
};

