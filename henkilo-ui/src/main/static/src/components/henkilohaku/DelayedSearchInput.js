import React from 'react'
import PropTypes from 'prop-types'
import ReactTimeout from 'react-timeout'

class DelayedSearchInput extends React.Component {
    static propTypes = {
        setSearchQueryAction: PropTypes.func.isRequired,
        defaultNameQuery: PropTypes.string,
        placeholder: PropTypes.string,
    };

    constructor(props) {
        super(props);

        this.timeout = 200;

        this.state = {
            timeoutEvent: null,
        };
    };

    render() {
        return <input className="oph-input"
                      autoFocus
                      defaultValue={this.props.defaultNameQuery || ''}
                      onKeyUp={this.typewatch.bind(this)}
                      placeholder={this.props.placeholder} />;
    };

    typewatch(event) {
        const value = event.target;
        if(this.state.timeoutEvent !== null) {
            this.props.clearTimeout(this.state.timeoutEvent);
        }
        this.setState({
            timeoutEvent: this.props.setTimeout(() => {
                this.setState({timeoutEvent: null});
                this.props.setSearchQueryAction(value);
            }, this.timeout),
        });
    };
}

export default ReactTimeout(DelayedSearchInput);
