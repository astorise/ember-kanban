import Ember from 'ember';
import layout from '../templates/components/kb-add-button';

export
default Ember.Component.extend({
  layout,
  tagName: 'button',
    classNames: ['btn', 'btn-success', 'btn-xs'],
    classNameBindings: ['pullRight:pull-right'],
    actions: {}
});

