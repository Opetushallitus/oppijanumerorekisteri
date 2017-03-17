import React from 'react'

const wrapperStyles = {
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  background: 'rgba(0, 0, 0, 0.8)',
  zIndex: 99999,
  pointerEvents: 'auto',
  overflowY: 'auto'
}

const Modal = React.createClass({
  propTypes: {
    show: React.PropTypes.bool.isRequired,
    onClose: React.PropTypes.func.isRequired,
    closeOnOuterClick: React.PropTypes.bool.isRequired,
  },

  render: function() {
    if (this.props.show) {
      return (
        <div
          style={wrapperStyles}
          onClick={this.hideOnOuterClick}
          data-modal="true">
          {this.props.children}
        </div>
      )
    } else {
      return null
    }
  },

  hideOnOuterClick: function(e) {
    if (e.target.dataset.modal && this.props.closeOnOuterClick) {
      this.props.onClose(e)
    }
  }

});

export default Modal
