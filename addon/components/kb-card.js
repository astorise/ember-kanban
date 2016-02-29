import Ember from 'ember';
import layout from '../templates/components/kb-card';

export
default Ember.Component.extend({
  layout,
  classNames: ['panel', 'panel-info', 'kb-card'],

    attributeBindings: ['data-id'],

    'data-id': function() {
      return this.get('card.id');
    }.property('card.id'),

    actions: {
      deleteCard() {
        var card = this.get('card');
        if (this.attrs.deleteCard) {
          return this.attrs.deleteCard(card);
        }
        this.get(`card.parent`).then(column => {
          column.get('children').removeObject(card);
          column.save().then(() => {
            card.destroyRecord();
            column.reload();
          });
        });
      },
    }
});

