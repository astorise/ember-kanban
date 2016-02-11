import Ember from 'ember';
import layout from '../templates/components/kb-delete-button';

export
default Ember.Component.extend({
  layout,
  tagName: 'button',
  classNames: ['btn', 'btn-danger', 'btn-xs'],
  classNameBindings:['pullRight:pull-right'],
  actions: {}
});

