import React from 'react'
import PropTypes from 'prop-types'
import ReactTimeout from 'react-timeout'

// Provides input with delay timer and single action queue.
class DelayedSearchInput extends React.Component {
    static propTypes = {
        setSearchQueryAction: PropTypes.func.isRequired,
        loading: PropTypes.bool.isRequired,
        defaultNameQuery: PropTypes.string,
        placeholder: PropTypes.string,
        customTimeout: PropTypes.number,
    };

    constructor(props) {
        super(props);

        this.timeout = this.props.customTimeout || 500;

        this.state = {
            timeoutEvent: null,
            singleActionQueue: null,
        };
    }

    componentWillReceiveProps(nextProps) {
        if(!nextProps.isLoading && this.state.singleActionQueue !== null) {
            this.state.singleActionQueue();
            this.setState({
                singleActionQueue: null,
            });
        }
    }

    render() {
        return <input className="oph-input"
                      autoFocus
                      defaultValue={this.props.defaultNameQuery || ''}
                      onKeyUp={this.typewatch.bind(this)}
                      placeholder={this.props.placeholder} />;
    }

    typewatch(event) {
        const value = event.target;
        if(this.state.timeoutEvent !== null) {
            this.props.clearTimeout(this.state.timeoutEvent);
        }
        this.setState({
            timeoutEvent: this.props.setTimeout(() => {
                this.setState({timeoutEvent: null});
                if(this.props.loading) {
                    this.setState({singleActionQueue: () => this.props.setSearchQueryAction(value),})
                }
                else {
                    this.props.setSearchQueryAction(value);
                }
            }, this.timeout),
        });
    }
}

export default ReactTimeout(DelayedSearchInput);
