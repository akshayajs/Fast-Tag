// config/environment.js
'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'fast-tag',
    environment,
    rootURL: '/',
    locationType: 'history',
    EmberENV: {
      FEATURES: { },
      EXTEND_PROTOTYPES: {
        Date: false,
        Array: false
      }
    },

    APP: {
      apiHost: 'http://localhost:8080',
      tomcatContextPath: '', 
      servletMapping: 'fasttag'
    }
  };

  if (environment === 'development') { }
  if (environment === 'test') { }
  if (environment === 'production') { }

  return ENV;
};