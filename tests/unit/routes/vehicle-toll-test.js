import { module, test } from 'qunit';
import { setupTest } from 'fast-tag/tests/helpers';

module('Unit | Route | vehicle-toll', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:vehicle-toll');
    assert.ok(route);
  });
});
