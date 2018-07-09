// @flow
import React from 'react';
import {connect} from 'react-redux';
import './InfoPage.css';


type InfoPageProps = {
    children: any,
    topicLocalised: string,
}

class InfoPage extends React.Component<InfoPageProps> {
    render() {
        return <div className="infoPageWrapper">
            <p className="oph-h2 oph-bold">{this.props.topicLocalised}</p>
            {this.props.children}
        </div>;
    }
}

export default connect( () => ({}), {})(InfoPage);
