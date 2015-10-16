require('plugins/octojefe/less/main.less');
require('ui/modules').get('kibana').config(function (PrivateProvider) {
  PrivateProvider.swap(require('ui/config/defaults'), function ($injector) {
    var defaults = $injector.invoke(require('ui/config/defaults'));
    defaults['timepicker:timeDefaults'] = {
      type: 'json',
      value: JSON.stringify({
        from: 'now-1w',
        to: 'now',
        mode: 'quick'
      })
    };
    defaults['timepicker:refreshIntervalDefaults'] = {
      type: 'json',
      value: JSON.stringify({
        display: '10 seconds',
        pause: false,
        value: 10000
      })
    };
    return defaults;
  });
});

require('ui/chrome')
  .setNavBackground('#222222')
  .setTabDefaults({
    resetWhenActive: true,
    trackLastPath: true,
    activeIndicatorColor: '#EFF0F1'
  })
  .setRootController('octojefe', function ($scope) {
  });


