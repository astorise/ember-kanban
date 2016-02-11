import Ember from 'ember';

export default Ember.Service.extend({
  count: function() {
    var count = localStorage.getItem('counter_count') || 0;
    count++;
    localStorage.setItem('counter_count', count);
    return count;
  }.property().volatile(),
});
