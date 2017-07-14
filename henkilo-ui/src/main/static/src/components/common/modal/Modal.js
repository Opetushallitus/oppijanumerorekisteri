import React from 'react'
import PropTypes from 'prop-types'

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

export default class Modal extends React.Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    closeOnOuterClick: PropTypes.bool.isRequired,
  };

  render() {
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
  }

  hideOnOuterClick(e) {
    if (e.target.dataset.modal && this.props.closeOnOuterClick) {
      this.props.onClose(e)
    }
  }

}

