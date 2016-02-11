import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('kb-add-button', 'Integration | Component | kb add button', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{kb-add-button}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#kb-add-button}}
      template block text
    {{/kb-add-button}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
