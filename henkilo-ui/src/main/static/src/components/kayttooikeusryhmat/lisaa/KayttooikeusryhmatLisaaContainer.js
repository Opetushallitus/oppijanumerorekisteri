import React from 'react';
import {connect} from 'react-redux';
import {kayttooikeusryhmatNavigation} from '../../navigation/navigationconfigurations';
import {updateNavigation} from '../../../actions/navigation.actions';

class KayttooikeusryhmatLisaaContainer extends React.Component {

    componentDidMount() {
        this.props.updateNavigation(kayttooikeusryhmatNavigation, '/');
    }

    render() {
        return <div className="wrapper">
            <h3>here</h3>
        </div>
    }

}

const mapStateToProps = (state, ownProps) => ({updateNavigation});

export default connect(mapStateToProps, {updateNavigation})(KayttooikeusryhmatLisaaContainer)