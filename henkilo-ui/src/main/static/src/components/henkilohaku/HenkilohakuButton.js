import React from 'react'
import ReactTimeout from 'react-timeout'

class HenkilohakuButton extends React.Component {
    static propTypes = {
        setSearchQueryAction: React.PropTypes.func.isRequired,
        defaultNameQuery: React.PropTypes.string,
    };

    constructor(props) {
        super(props);

        this.timeout = 1000;

        this.state = {
            timeoutEvent: null,
        };
    };

    render() {
        return <input className="oph-input"
                      autoFocus
                      defaultValue={this.props.defaultNameQuery || ''}
                      onKeyUp={this.typewatch.bind(this)} />;
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

export default ReactTimeout(HenkilohakuButton);
