import Ember from 'ember';

export
default Ember.Mixin.create({
  connectWith: function() {
    if (this.get('connected')) {
      return this.get('selector');
    }
    return '';
  }.property('connected', 'selector'),

  selector: function() {
    return `.${this.get('parentModel')}-sortable`;
  }.property('parentModel'),


  makeSortable(options) {
    this.setProperties(options);
    var self = this;
    var el = this.$(this.get('sortableContainer'))[0];
    var sortable = Sortable.create(el, {
      group: this.get('connectWith'),
      animation: 150,
      ghostClass: 'kb-ghost',
      chosenClass: 'kb-dragging',
      setData: (dataTransfer, dragEl) => {
        var childId = $(dragEl).data('id');
        dataTransfer.setData(`kb/${self.get('childModel')}`, childId);
      },
      onAdd() {
        self.onAdd(...arguments);
      },
      onUpdate() {
        self.onUpdate(...arguments);
      },
    });
  },

  moveItem(itemId, newParent, childModel) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      if (!itemId) {
        debugger;
        resolve();
      } else {
        this.get('store').find(childModel, itemId).then(item => {
          newParent.get('children').then(newItems => {
            item.get('parent').then(oldParent => {
              oldParent.get('children').then((oldItems) => {
                newItems.pushObject(item);
                oldItems.removeObject(item);
                item.set('parent', newParent);
                oldParent.save().then(() => newParent.save().then(() => item.save().then(() => resolve())));
              });
            });
          });
        });
      }
    });

  },
});

