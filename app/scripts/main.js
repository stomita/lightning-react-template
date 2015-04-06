var React = require('react');
var _ = require("lodash");

var RecordList = require('./components/record-list');

/**
 * A bridge instance which has 'render' call to receive from
 */
module.exports = createReactLightningBridge(RecordList, {
  // Mapping Lightning attributes to React component's property name
  // By default, all attributes defined Lightning component are applied to property with same name
  /*
  attributes: {
    sobjects: "sobjects",
    records: "records"
  },
  */
  // Mapping Lightning event to React component's handler function
  events: {
    select: "onSelectRecord"
  },

  // Action functions
  actions: {
    // 1st handler argument is bound to lightning component
    onSelectTable: function(cmp, table) {
      if (!table) {
        cmp.set('v.records', [])
      } else {
        var action = cmp.get('c.queryRecords');
        action.setParams({ table: table });
        action.setCallback(this, function(response) {
          var state = response.getState();
          if (state === 'SUCCESS') {
            cmp.set('v.records', response.getReturnValue());
          } else if (state === 'ERROR') {
            errors[0] && errors[0].message
            $A.error("Error message: " + errors[0].message);
          }
        });
        $A.enqueueAction(action);
      }
    }
  }
});

/**
 *
 */
function createReactLightningBridge(Component, config) {
  return {
    render : function(cmp, evt) {
      var self = this;
      var props = {};
      var cmpDef = cmp.getDef();

      if (!config.attributes) {
        config.attributes = {};
        cmpDef.getAttributeDefs().each(function(attr){
          var attrName = attr.getDescriptor().getName();
          if (attrName !== 'body' && attrName.indexOf('_') !== 0) {
            config.attributes[attrName] = attrName;
          }
        });
      }
      for (var attrName in config.attributes) {
        var propName = config.attributes[attrName];
        props[propName] = cmp.get('v.'+attrName);
      }

      if (!config.events) {
        config.events = {};
        cmpDef.getAllEvents().forEach(function(eventName) {
          config.events[eventName] = 'on' + ename[0].toUpperCase() + ename.substring(1);
        });
      }
      for (var eventName in config.events) {
        var handlerName = config.events[eventName];
        props[handlerName] = function(params) {
          $A.run(function() {
            var e = cmp.getEvent(ename);
            e.setParams(params);
            e.fire();
          });
        };
      }

      // action functions
      if (config.actions) {
        for (var actionName in config.actions) {
          props[actionName] = function() {
            var args = Array.prototype.slice.apply(arguments);
            args.unshift(cmp);
            $A.run(function() {
              config.actions[actionName].apply(config.actions, args);
            });
          }
        }
      }

      React.render(<Component {...props} />, cmp.getElement());
    }
  };
}
