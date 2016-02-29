import Ember from 'ember';
import layout from '../templates/components/kb-column';
import DragDrop from 'ember-kanban/mixins/dragdrop';

export
default Ember.Component.extend(DragDrop, {
  layout,
  store: Ember.inject.service(),
    //todo remove this dependency
    counter: Ember.inject.service('ls-counter'),
    classNames: ['panel', 'panel-primary', 'kb-column'],

    sortChildren: function() {
      this.get('column.children').then(cards => {
        console.log('**************** calc sortedCards');
        this.set('sortedCards', cards.sortBy('order'));
      });
    }.observes('column.children.[]').on('init'),
    //sortBy: ['order'],
    //sortedCards: Ember.computed.sort('column.children', 'sortBy'),

    attributeBindings: ['data-id'],
    'data-id': function() {
      return this.get('column.id');
    }.property('column.id'),

    updateCardPositions() {
      var cardModel = this.get('cardModel');
      var columnModel = this.get('columnModel');
      var promises = [];
      this.$('.kb-card').each((index, cardEl) => {
        let cardId = $(cardEl).data('id');
        promises.push(this.get('store').find(cardModel, cardId).then(card => {
          card.set('order', index);
        }));
      });
      return promises;
    },

    didInsertElement() {
      var self = this;
      this.makeSortable({
        parentModel: 'column',
        parentId: this.get('column.id'),
        childSelector: '.kb-card',
        sortableContainer: '.kb-cards',
        childModel: this.get('cardModel'),
        connected: true,

        onAdd(evt) {
          self.beginPropertyChanges();
          self.set('promisesForAdding', self.updateCardPositions());
          Ember.RSVP.all(self.get('promisesForAdding')).then(() => {
            var cardId = $(evt.item).data('id');
            var cardModel = this.get('cardModel');
            self.moveItem(cardId, self.get('column'), cardModel).then(() => {
              self.endPropertyChanges();
            });
          });
        },
        onUpdate: (evt) => {
          Ember.RSVP.all(self.updateCardPositions()).then(() => {
            self.get('column').save();
          });
        },
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

