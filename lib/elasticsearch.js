var config = require('../.config.json');
var Client = require('elasticsearch').Client;
module.exports = new Client(config.elasticsearch || {});
