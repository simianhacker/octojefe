var moment = require('moment');
var log = require('./log');
module.exports = function (type, startTime) {
  return function () {
    var endTime = moment.utc();
    var duration = endTime.valueOf() - startTime.valueOf();
    return log(type, {
      message: 'Import data from ' + type,
      since: startTime.toISOString(),
      type: 'run',
      startTime: startTime,
      endTime: endTime,
      duration: duration,
    });
  };
};
