import { module, test } from 'qunit';
import { setupTest } from 'fast-tag/tests/helpers';

module('Unit | Route | home', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:home');
    assert.ok(route);
  });
});
