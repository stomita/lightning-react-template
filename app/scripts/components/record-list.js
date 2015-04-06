/**
 *
 */
var React = require('react');
var _ = require('lodash');

/**
 *
 */
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
      this.props.onSelectRecord(_.extend({ type: this.props.table }, record));
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

module.exports = RecordList;
