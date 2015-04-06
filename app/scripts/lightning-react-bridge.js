/**
 *
 */
var React = require('react');

/**
 *
 */
function createReactPropsFromLightningComp(cmp, config) {
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
      config.events[eventName] = 'on' + eventName[0].toUpperCase() + eventName.substring(1);
    });
  }
  for (var eventName in config.events) {
    var handlerName = config.events[eventName];
    props[handlerName] = function(params) {
      $A.run(function() {
        var e = cmp.getEvent(eventName);
        e.setParams(params);
        e.fire();
      });
    };
  }

  // add functions to manipulate lightning component
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

  return props;
}

/**
 * Create a bridge instance to render react
 * @param {ReactComponent} Component
 * @param {Object} config
 */
function createLightningReactBridge(Component, config) {
  return {
    /**
     * Renderer function
     */
    render : function(cmp, evt) {
      var props = createReactPropsFromLightningComp(cmp, config);
      var container = config.id ? cmp.find(config.id) : cmp;
      React.render(<Component {...props} />, container.getElement());
    }
  };
}

/**
 *
 */
module.exports = {
  create: createLightningReactBridge
};
