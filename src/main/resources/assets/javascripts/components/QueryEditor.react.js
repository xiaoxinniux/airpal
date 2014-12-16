/** @jsx React.DOM */
var React = require('react');

/* Views */
var QuerySaveModal = require('./QuerySaveModal.react');

/* Helpers */
var OverlayMixin  = require('react-bootstrap').OverlayMixin,
    _ = require('lodash');

/* Editor */
var ace = require('brace'),
    Placeholder = ace.acequire('ace/placeholder').Placeholder,
    Range = ace.acequire('ace/range').Range;

require('brace/theme/monokai');
require('brace/mode/sql');

var QueryEditor = React.createClass({
  displayName: 'QueryEditor',
  mixins: [OverlayMixin],

  componentDidMount: function() {

    // Create the editor
    this.editor = ace.edit(this.refs.queryEditor.getDOMNode());

    // Set the theme and the mode
    this.editor.setTheme('ace/theme/monokai');
    this.editor.getSession().setMode('ace/mode/sql');

    // Listen to the selection event
    this.editor.selection.on('changeSelection', _.debounce(
      this.handleChangeSelection, 150, { maxWait: 150 }
    ));

  },

  getInitialState: function() {
    return {
      isModalOpen: false,
      runText: 'query'
    };
  },

  render: function () {
    return (
      <div className="row spaced">
        <div className="col-sm-12">

          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Query editor</h3>
            </div>
            <div className="panel-body">
              <div ref="queryContainer" className="col-sm-12 editor-container">

                <pre ref="queryEditor" className="editor">
                  SELECT COUNT(1) FROM users
                </pre>

                <div ref="handle" className="editor-resize-handles">
                  <span className="glyphicon glyphicon-chevron-up editor-resize-handle" onClick={this.handleResizeShrink} title="Shrink Editor"></span>
                  <span className="glyphicon glyphicon-chevron-down editor-resize-handle" onClick={this.handleResizeGrow} title="Grow Editor"></span>
                </div>

              </div>
            </div>
          </div>

        </div>

        <div className="col-sm-12">
          <div className="row">

            <div className="col-sm-6">
              <input ref="customName" type="text" name="custom-name" className="form-control" placeholder="Select a custom table name" />
            </div>

            <div className="col-sm-6 text-right">
              <div className="btn-toolbar pull-right">
                <div className="btn-group">
                  <button className="btn btn-primary" onClick={this.handleToggle}>Save {this.state.runText}</button>
                </div>

                <div className="btn-group">
                  <button className="btn btn-success">Run {this.state.runText}</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  },

  renderOverlay: function() {
    if( !this.state.isModalOpen ) return(<span />);

    // Render the modal when it's needed
    return (<QuerySaveModal onRequestHide={this.handleToggle} query={this._getQuery()} />);
  },

  // - Internal events ----------------------------------------------------- //
  handleToggle: function () {
    this.setState({
      isModalOpen: !this.state.isModalOpen
    });
  },

  handleChangeSelection: function() {
    var range = this.editor.selection.getRange();

    // Define the text based on the current text range
    var text = ( !this._isRangeStartSameAsEnd(range) ) ? 'selection' : 'query';
    if ( text === this.state.runText ) return;

    // Update the state with the new runText
    this.setState({ runText: text });
  },

  handleResizeShrink: function($event) {
    this._resizeEditor(-120);
  },

  handleResizeGrow: function($event) {
    this._resizeEditor(120);
  },

  // - Internal helpers ---------------------------------------------------- //

  // Resizes the editor based on the given pixels
  // @param {integer} the amount of pixels to increase/decrease the editor
  _resizeEditor: function(pixels) {

    // Get the editor by className
    var $el = $(this.refs.queryEditor.getDOMNode());

    // Animate the editor height
    $el.animate({
      height: $el.height() + pixels },
      {
        duration: 300,

        // Notify the AceEditor on completion that it has resized
        complete: function() {
          this.editor.resize(true);
        }.bind(this)
      }
    );
  },

  // Retrieves the current query
  // @return {string} the query string
  _getQuery: function() {
    var query, range = this.editor.selection.getRange();

    // Define the current query
    if ( !this._isRangeStartSameAsEnd(range) ) {
      query = this.editor.session.getTextRange(range);
    } else {
      query = this.editor.getValue();
    }

    // Return the query value
    return query;
  },

  // Checks or there is currently something selected
  // @return {boolean} is the start equal to the end of the selection
  _isRangeStartSameAsEnd: function(range) {
    var start = range.start,
        end   = range.end;

    // Return of the start equals the end of the selection
    return !!start && !!end &&
      (start.row === end.row) &&
      (start.column === end.column);
  }
});

module.exports = QueryEditor;