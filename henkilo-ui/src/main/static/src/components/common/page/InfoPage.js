// @flow
import React from 'react';
import {connect} from 'react-redux';
import {updateNavigation} from "../../../actions/navigation.actions";
import './InfoPage.css';
import background from '../../../img/unauthenticated_background.jpg';
import {emptyNavi} from "../../navigation/navigationconfigurations";
import type {UpdateNaviType} from "../../../types/navigation.type";


type Props = {
    children: any,
    topicLocalised: string,
    updateNavigation: UpdateNaviType,
}

class InfoPage extends React.Component<Props> {
    componentWillMount() {
        this.props.updateNavigation(emptyNavi, null, background);
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

export default connect(mapStateToProps, {updateNavigation})(InfoPage);
