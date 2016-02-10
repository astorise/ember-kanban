import Ember from 'ember';
import DragdropMixin from '../../../mixins/dragdrop';
import { module, test } from 'qunit';

module('Unit | Mixin | dragdrop');

// Replace this with your real tests.
test('it works', function(assert) {
  let DragdropObject = Ember.Object.extend(DragdropMixin);
  let subject = DragdropObject.create();
  assert.ok(subject);
});
