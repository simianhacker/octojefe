var Promise = require('bluebird');
var join = require('path').join;

module.exports = function (kibana) {
  return new kibana.Plugin({
    name: 'octojefe',

    uiExports: {
      app: {
        title: 'Octojefe',
        description: 'Jefe de Github',
        main: 'plugins/octojefe/octojefe',
        autoload: kibana.autoload.styles,
        injectVars: function (server, options) {
          var config = server.config();
          return {
            octojefeMaxBucketSize: config.get('octojefe.max_bucket_size'),
            octojefeIndex: config.get('octojefe.index')
          };
        }
      },
      // modules: {
      //   // 'react$': require.resolve('react')
      // }
    },

    config: function (Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
        index: Joi.string().default('octojefe'),
        max_bucket_size: Joi.number().default(10000)
      }).default();
    },

    init: function (server, options) {

    }
  });
};

