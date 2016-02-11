import Ember from 'ember';
import layout from '../templates/components/kb-column';
import DragDrop from 'ember-kanban/mixins/dragdrop';

export
default Ember.Component.extend(DragDrop, {
  layout,
  store: Ember.inject.service(),
  counter: Ember.inject.service(),
  classNames: ['panel','panel-primary','kb-column', 'item'],

  attributeBindings: ['data-id'],
  'data-id': function() {
    return this.get('column.id');
  }.property('column.id'),

  didInsertElement() {
    this.makeSortable({
      parentModel: 'column',
      childModel: 'card',
      connected: true
    });
  },


  actions: {
    deleteColumn() {
        var column = this.get('column');
        this.get('column.board').then(board => {
          board.get('columns').removeObject(column);
          board.save().then(() => {
            column.destroyRecord();
          });

        });
      },
      addCard() {
        this.get('column.cards').then(cards => {
          var max = cards.length ? cards.mapBy('order').sort().reverse()[0] + 1 : 1;
          var card = this.get('store').createRecord(this.get('cardModel'), {
            name: `Card ${this.get('counter.count')}`,
            order: max,
          });
          this.get('column.cards').pushObject(card);
          this.get('column').save();

        })
      }
  }
});

