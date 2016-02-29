/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-kanban',
  included: function(app) {
    this._super.included(app);
    app.import(app.bowerDirectory + '/Sortable/Sortable.js');
  },
  isDevelopingAddon: function() {
    return true;
  }
};

