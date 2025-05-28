import { module, test } from 'qunit';
import { setupTest } from 'fast-tag/tests/helpers';

module('Unit | Route | register/vehicles', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:register/vehicles');
    assert.ok(route);
  });
});
