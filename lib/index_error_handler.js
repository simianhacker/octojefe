var moment = require('moment');
var log = require('./log');
module.exports = function (type, startTime) {
  return function (err) {
    if (!err) err = new Error('Unknown error');
    var endTime = moment.utc();
    var duration = endTime.valueOf() - startTime.valueOf();
    var body = {
      message: err.message,
      stack: err.stack,
      type: 'error',
      startTime: startTime,
      endTime: endTime,
      duration: duration
    };
    if (err.code) body.statusCode = err.code;
    if (err.subject_id) body.subject_id = err.subject_id;
    if (err.body) body.body = err.body;
    if (err.resp) {
      body.response = {
        url: err.resp.url,
        headers: err.resp.headers,
        statusCode: err.resp.statusCode
      };
    }
    return log(type, body);
  };
};
