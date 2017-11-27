// @flow
import React from 'react';
import {connect} from 'react-redux';
import {updateUnauthenticatedNavigation} from "../../../actions/navigation.actions";
import './InfoPage.css';


type Props = {
    children: any,
    topicLocalised: string,
    updateUnauthenticatedNavigation: () => void,
}

class InfoPage extends React.Component<Props> {
    componentWillMount() {
        this.props.updateUnauthenticatedNavigation();
    }

    render() {
        return <div className="infoPageWrapper">
            <p className="oph-h2 oph-bold">{this.props.topicLocalised}</p>
            {this.props.children}
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => ({

});

export default connect(mapStateToProps, {updateUnauthenticatedNavigation})(InfoPage);
