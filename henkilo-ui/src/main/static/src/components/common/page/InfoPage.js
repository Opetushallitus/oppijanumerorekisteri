// @flow
import React from 'react';
import {connect} from 'react-redux';
import './InfoPage.css';


type Props = {
    children: any,
    topicLocalised: string,
    updateUnauthenticatedNavigation: () => void,
}

class InfoPage extends React.Component<Props> {
    render() {
        return <div className="infoPageWrapper">
            <p className="oph-h2 oph-bold">{this.props.topicLocalised}</p>
            {this.props.children}
        </div>;
    }
}

export default connect( () => ({}), {})(InfoPage);
