var React = require('react');
var _ = require("lodash");

var RecordList = React.createClass({
  propTypes: {
    sobjects: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    records: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        Id: React.PropTypes.string.isRequired,
        Name: React.PropTypes.string.isRequired
      })
    ),
    onSelectTable: React.PropTypes.func,
    onSelectRecord: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      sobjects: [],
      records: [],
    };
  },

  onSelectTable: function(e) {
    if (this.props.onSelectTable) {
      var table = e.target.value;
      this.props.onSelectTable(table);
    }
  },

  onSelectRecord: function(record) {
    if (this.props.onSelectRecord) {
      this.props.onSelectRecord(record);
    }
  },

  render: function() {
    var options = this.props.sobjects.map(function(sobject) {
      return <option value={ sobject }>{ sobject }</option>
    });
    return (
      <div>
        Table :
        <select onChange={ this.onSelectTable }>
          <option value=""></option>
          { options }
        </select>
        <ul>
          {
            this.props.records.map(function(rec) {
              return (
                <li key={ rec.Id }>
                   <a href="javascript:void(0)" onClick={ this.onSelectRecord.bind(this, rec) }>{ rec.Name }</a>
                </li>
              );
            }, this)
          }
        </ul>
      </div>
    );
  }
});

/**
 *
 */
module.exports = createReactLightningBridge(RecordList, {
  /*
  attributes: {
    sobjects: "sobjects",
    records: "records"
  },
  */
  events: {
    select: "onSelectRecord"
  },
  actions: {
    onSelectTable: function(cmp, table) {
      if (!table) {
        cmp.set('v.records', [])
      } else {
        var records = new Array(51).join('_').split('').map(function(a, i) {
          return {
            Id: String(10001+i),
            Name: table + ' ' + (i+1)
          };
        });
        cmp.set('v.records', records);
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

      console.log("props = ", props);

      React.render(<Component {...props} />, cmp.getElement());
    }
  };
}
