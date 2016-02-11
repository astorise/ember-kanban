import Ember from 'ember';

export
default Ember.Mixin.create({
  childModels: function() {
    return Ember.String.pluralize(this.get('childModel'));
  }.property('childModel'),
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
    var isReceiving = false;
    this.$(this.get('selector')).sortable({
      connectWith: this.get('connectWith'),
      start(event, ui) {
        ui.item.addClass('kb-dragging');
      },
      stop(event, ui) {
        ui.item.removeClass('kb-dragging');
      },
      receive(event, ui) {
        isReceiving = true;
        var itemId = ui.item.data('id');
        self.receiveItem(itemId).then(() => {
          self.updateIndexes.call(self);
        });
      },
      remove(event, ui) {
        var itemId = ui.item.data('id');
        self.removeItem(itemId).then(() => {
          self.updateIndexes.call(self);
        });
      },
      update(event, ui) {
        if (isReceiving) {
          isReceiving = false;
        } else {
          self.updateIndexes.call(self);
        }
      }
    });

  },

  updateIndexes() {
    var {
      childModel, parentModel, childModels
    } = this.getProperties('childModel', 'parentModel', 'childModels');
    this.beginPropertyChanges();
    var items = this.get(`${parentModel}.${childModels}`);
    this.$(`.kb-${childModel}`).each(function(index) {
      var id = $(this).data('id');
      var item = items.findBy('id', id);
      if (item) {
        item.set('order', index)
      };
    });
    items.invoke('save');
    this.endPropertyChanges();
  },

  removeItem(itemId) {
    var {
      childModel, parentModel, childModels
    } = this.getProperties('childModel', 'parentModel', 'childModels');
    return new Ember.RSVP.Promise((resolve, reject) => {
      if (!itemId) {
        resolve();
      } else {
        this.get('store').find(childModel, itemId).then(item => {
          var oldParent = this.get(parentModel);
          oldParent.get(childModels).then((oldItems) => {
            oldItems.removeObject(item);
            oldParent.save().then(() => {
              resolve();
            });
          });
        });
      }
    });
  },

  receiveItem(itemId) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      var {
        childModel, parentModel, childModels
      } = this.getProperties('childModel', 'parentModel', 'childModels');
      if (!itemId) {
        resolve();
      } else {
        this.get('store').find(childModel, itemId).then(item => {
          var newParent = this.get(parentModel);
          newParent.get(childModels).then(newItems => {
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

