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
    this.$(this.get('selector')).sortable({
      handle: '.panel-heading',
      connectWith: this.get('connectWith'),
      start(event, ui) {
        console.log(`>>>>>>>>>>>>>> ${self.get('column.name')} >>>>> start`);
        ui.item.addClass('kb-dragging');
        ui.item.data('kb-drag-from', event.target);
      },
      stop(event, ui) {
        console.log(`>>>>>>>>>>>>>> ${self.get('column.name')} >>>>> stop`);
        self.beginPropertyChanges();
        ui.item.removeClass('kb-dragging');
        var dragTo = ui.item.data('kb-drag-to');
        if (dragTo) {
          var itemId = ui.item.data('id');
          self.removeItem(itemId).then(() => {
            self.receiveItem(itemId, dragTo.model).then(() => {
              self.updateIndexes.call(self, dragTo).then(() => {
                ui.item.data('kb-drag-to', null);
                self.endPropertyChanges();
              });
            });
          });
        } else {
          self.updateIndexes.call(self).then(() => {
            self.endPropertyChanges();
          });
        }
      },
      receive(event, ui) {
        console.log(`>>>>>>>>>>>>>> ${self.get('column.name')} >>>>> receive`);
        ui.item.data('kb-drag-to', {
          el: event.target,
          model: self.get(self.get('parentModel'))
        });
      },
    });

  },

  updateIndexes(newParent) {
    var {
      parentModel, childSelector
    } = this.getProperties('parentModel', 'childSelector');
    var promise1 = this.get(`${parentModel}.children`).then(items => {
      //update my children
      this.$(childSelector).each(function(index) {
        var id = Ember.$(this).data('id');
        var item = items.findBy('id', id);
        if (item) {
          item.set('order', index);
        }
      });
      return Ember.RSVP.all(items.invoke('save'));
    });

    if (newParent) {
      //drag across connected lists, update the new parent
      var promise2 = newParent.model.get('children').then(items => {
        Ember.$(newParent.el).find(childSelector).each(function(index) {
          var id = Ember.$(this).data('id');
          var item = items.findBy('id', id);
          if (item) {
            item.set('order', index);
          }
        });
        return Ember.RSVP.all(items.invoke('save'));
      });
      return Ember.RSVP.all([promise1, promise2]);
    }
    return promise1;
  },

  removeItem(itemId) {
    var {
      childModel, parentModel
    } = this.getProperties('childModel', 'parentModel');
    return new Ember.RSVP.Promise((resolve) => {
      if (!itemId) {
        resolve();
      } else {
        this.get('store').find(childModel, itemId).then(item => {
          var oldParent = this.get(parentModel);
          oldParent.get('children').then((oldItems) => {
            oldItems.removeObject(item);
            oldParent.save().then(() => {
              oldParent.reload();
              resolve();
            });
          });
        });
      }
    });
  },

  receiveItem(itemId, newParent) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      var {
        childModel
      } = this.getProperties('childModel');
      if (!itemId) {
        resolve();
      } else {
        this.get('store').find(childModel, itemId).then(item => {
          newParent.get('children').then(newItems => {
            newItems.pushObject(item);
            newParent.save().then(() => {
              newParent.reload(); // for some reason if i take this out newly created columns disappear after drag and drop
              resolve();
            });
          });
        });
      }
    });
  },
});

