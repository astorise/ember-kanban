import Ember from 'ember';
import layout from '../templates/components/kb-card';

export
default Ember.Component.extend({
  layout,
  classNames: ['panel', 'panel-info', 'kb-card'],

    //draggable: true,
    attributeBindings: ['data-id', 'draggable'],
    'data-id': function() {
      return this.get('card.id');
    }.property('card.id'),


    //dragStart(e) {
    //e.dataTransfer.setData('kb/card', this.get('card.id'));
    ////console.log('dragStart', this.get('card.name'));
    ////console.log(`dragging from column: ${this.get('card.parent.name')}`);
    ////this.$().addClass('kb-dragging');
    //},
    //dragOver(e) {
    //console.log(e);
    //},
    //dragEnd(e) {
    //console.log('dragEnd', this.get('card.name'));
    ////this.$().removeClass('kb-dragging');
    //},

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

