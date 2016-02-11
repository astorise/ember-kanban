import Ember from 'ember';
import layout from '../templates/components/kb-board';

import DragDrop from 'ember-kanban/mixins/dragdrop';

export
default Ember.Component.extend(DragDrop, {
  layout,
  store: Ember.inject.service(),
    sortableClass: function() {
      return `board-sortable`;
    }.property(),

    sortChildren: function() {
      this.get('board.children').then(columns => {
        this.set('sortedColumns', columns.sortBy('order'));
      });
    }.observes('board.children.[].order').on('init'),

    counter: Ember.inject.service('ls-counter'),
    classNames: ['kb-board'],
    classNameBindings: ['hidden'],

    hidden: function() {
      return !this.get('board');
    }.property('board'),

    didInsertElement() {
      this.makeSortable({
        parentModel: 'board',
        childSelector:'.kb-column',
        childModel: this.get('columnModel'),
        connected: true
      });
    },

    actions: {

      deleteBoard() {
          var board = this.get('board');
          if (this.attrs.deleteBoard) {
            return this.attrs.deleteBoard(board);
          }
          board.destroyRecord();
        },

        addColumn() {
          var board = this.get('board');
          if (this.attrs.addColumn) {
            return this.attrs.addColumn(board);
          }

          this.beginPropertyChanges();
          board.get('children').then(columns => {
            var max = columns.length ? columns.mapBy('order').sort().reverse()[0] + 1 : 1;
            var newColumn = this.get('store').createRecord(this.get('columnModel'), {
              name: `Column ${this.get('counter.count')}`,
              order: max,
            });
            columns.pushObject(newColumn);
            board.save().then(b => b.reload()).finally(() => this.endPropertyChanges());
          });
        }
    }
});

