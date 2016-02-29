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
      handle: '.panel-heading',
      ghostClass: 'kb-ghost',
      chosenClass: 'kb-dragging',
      setData: (dataTransfer, dragEl) => {
        var childId = $(dragEl).data('id');
        dataTransfer.setData(`kb/${self.get('childModel')}`, childId);
      },
      onAdd(evt) {
        self.beginPropertyChanges();
        self.set('promisesForAdding', self.updateChildrenPositions());
        Ember.RSVP.all(self.get('promisesForAdding')).then(() => {
          var childId = $(evt.item).data('id');
          var childModel = self.get('childModel');
          var parentModel = self.get('parentModel');
          self.moveItem(childId, self.get(parentModel), childModel).then(() => {
            self.endPropertyChanges();
          });
        });
      },
      onUpdate(evt) {
        Ember.RSVP.all(self.updateChildrenPositions()).then(() => {
          var parentModel = self.get('parentModel');
          self.get(parentModel).save();
        });
      },
    });
  },


  updateChildrenPositions() {
    var childModel = this.get('childModel');
    var childSelector = this.get('childSelector');
    var promises = [];
    this.$(childSelector).each((index, cardEl) => {
      let childId = $(cardEl).data('id');
      promises.push(this.get('store').find(childModel, childId).then(child => {
        child.set('order', index);
      }));
    });
    return promises;
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

