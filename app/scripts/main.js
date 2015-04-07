var React = require('react');

var RecordList = require('./components/record-list');
var LightningReactBridge = require('./lightning-react-bridge')

/**
 * A bridge instance which has 'render' call to receive from
 */
module.exports = LightningReactBridge.create(RecordList, {
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
            if (errors[0] && errors[0].message) {
              $A.error("Error message: " + errors[0].message);
            }
          }
        });
        $A.enqueueAction(action);
      }
    }
  }
});
