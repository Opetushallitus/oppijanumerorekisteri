import React from 'react'
import ReactTimeout from 'react-timeout'

class HenkilohakuButton extends React.Component {
    static propTypes = {
        setSearchQueryAction: React.PropTypes.func.isRequired,
        searchAction: React.PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.timeout = 2000;

        this.state = {
            timeoutEvent: null,
        };
    };

    render() {
        return <input className="oph-input"
                      onKeyUp={this.typewatch.bind(this)} />;
    };

    typewatch(event) {
        this.props.setSearchQueryAction(event.target);
        if(this.state.timeoutEvent !== null) {
            this.props.clearTimeout(this.state.timeoutEvent);
        }
        this.setState({
            timeoutEvent: this.props.setTimeout(() => {
                this.setState({timeoutEvent: null});
                this.props.searchAction();
            }, this.timeout),
        });
    };
}

export default ReactTimeout(HenkilohakuButton);
