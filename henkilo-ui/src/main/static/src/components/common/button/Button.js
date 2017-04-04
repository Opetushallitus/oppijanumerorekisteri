import './Button.css'
import React from 'react'
import classNames from 'classnames/bind';

class Button extends React.Component {

    static propTypes = {
        action: React.PropTypes.func.isRequired,
        disabled: React.PropTypes.bool,
        href: React.PropTypes.string,
        confirm: React.PropTypes.bool,
        big: React.PropTypes.bool,
        cancel: React.PropTypes.bool,
        errorMessage: React.PropTypes.shape({errorTopic: React.PropTypes.string, errorText: React.PropTypes.string, })
    };

    constructor(props) {
        super(props);
        this.state = {
            styles: {
                top: 0,
                left: 0,
            },
            showError: false,
        }
    }

    componentDidMount() {
        this.setState({
            styles: {
                top: this.refs.button.getClientRects()[0].top + -120 + 'px',
                left: this.refs.button.getClientRects()[0].left + 'px',
            }
        });
    };

    componentWillReceiveProps(nextProps) {
        nextProps.errorMessage && nextProps.errorMessage.errorTopic && this.setState({showError: true,});
    };

    render() {
        const className = classNames({
            'oph-button': true,
            'oph-button-primary': !this.props.confirm && !this.props.cancel,
            'oph-button-confirm': this.props.confirm,
            'oph-button-big': this.props.big,
            'oph-button-cancel': this.props.cancel,
            [`${this.props.className}`]: this.props.className,
        });
        return (
            this.props.href
                ? <a href={this.props.href} className="a" onClick={this.props.action}>{this.props.children}</a>
                :
                <div className="popup-button">
                    <button className={className} disabled={this.props.disabled} ref="button"
                            onClick={!this.props.disabled ? this.props.action : () => {}}>
                        {this.props.children}
                    </button>
                    {
                        this.state.showError && this.props.errorMessage && this.props.errorMessage.errorTopic
                            ? <div className="oph-popup oph-popup-error oph-popup-top"
                                 style={{position: 'absolute', top: this.state.styles.top, left: this.state.styles.left}}>
                                <button className="oph-button oph-button-close" type="button" title="Close" aria-label="Close"
                                        onClick={this.hide.bind(this)}>
                                    <span aria-hidden="true">×</span>
                                </button>
                                <div className="oph-popup-arrow" />
                                <div className="oph-popup-title">{this.props.errorMessage.errorTopic}</div>
                                <div className="oph-popup-content">{this.props.errorMessage.errorText}</div>
                            </div>
                            : null
                    }
                </div>
        );
    };

    hide() {
        this.setState({showError: false});
    }
}

export default Button;