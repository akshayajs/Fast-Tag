import EmberRouter from '@ember/routing/router';
import config from 'fast-tag/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('home');
  this.route('register', function() {
    this.route('vehicles');
    this.route('recharge');
    this.route('registration');
  });
  this.route('vehicle-toll', function() {
    this.route('toll-logs' );
    this.route('toll-entry');
  });
});
