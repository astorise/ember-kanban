import Ember from 'ember';
import layout from '../templates/components/kb-card';

export
default Ember.Component.extend({
  layout,
  classNames: ['panel', 'panel-info', 'kb-card', 'item'],

    attributeBindings: ['data-id'],
    'data-id': function() {
      return this.get('card.id');
    }.property('card.id'),

    actions: {

      deleteCard() {
        var card = this.get('card');
        this.get('card.column').then(column => {
          column.get('cards').removeObject(card);
          column.save().then(() => {
            card.destroyRecord();
          });

        });
      },
    }
});

