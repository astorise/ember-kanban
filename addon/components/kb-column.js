import Ember from 'ember';
import layout from '../templates/components/kb-column';
import DragDrop from 'ember-kanban/mixins/dragdrop';

export
default Ember.Component.extend(DragDrop, {
  layout,
  store: Ember.inject.service(),
    counter: Ember.inject.service('ls-counter'),
    classNames: ['panel', 'panel-primary', 'kb-column'],

    //todo remove this
    sortableClass: function() {
      return `column-sortable`;
    }.property(),

    sortChildren: function() {
      this.get('column.children').then(cards => {
        this.set('sortedCards', cards.sortBy('order'));
      });
    }.observes('column.children.[].order').on('init'),

    attributeBindings: ['data-id'],
    'data-id': function() {
      return this.get('column.id');
    }.property('column.id'),

    didInsertElement() {
      this.makeSortable({
        parentModel: 'column',
        childSelector: '.kb-card',
        childModel: this.get('cardModel'),
        connected: true
      });
    },


    actions: {
      deleteColumn() {
          var column = this.get('column');
          if (this.attrs.deleteColumn) {
            return this.attrs.deleteColumn(column);
          }
          this.get(`column.parent`).then(board => {
            board.get('children').removeObject(column);
            board.save().then(() => {
              column.destroyRecord();
              //board.reload();
            });
          });
        },

        addCard() {
          var column = this.get('column');
          if (this.attrs.addCard) {
            return this.attrs.addCard(column);
          }
          this.beginPropertyChanges();
          this.get('column.children').then(cards => {
            var max = cards.length ? cards.mapBy('order').sort().reverse()[0] + 1 : 1;
            var card = this.get('store').createRecord(this.get('cardModel'), {
              name: `Card ${this.get('counter.count')}`,
              order: max,
            });
            cards.pushObject(card);
            column.save().then(c => c.reload().finally(() => this.endPropertyChanges()));
          });
        }
    }
});

