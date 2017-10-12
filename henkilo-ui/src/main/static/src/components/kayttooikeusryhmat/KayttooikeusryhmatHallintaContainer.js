import React from 'react';
import {connect} from 'react-redux';
import {updateNavigation} from '../../actions/navigation.actions';
import {kayttooikeusryhmatNavigation} from '../navigation/navigationconfigurations';

class KayttooikeusryhmatContainer extends React.Component {

    componentDidMount() {
        this.props.updateNavigation(kayttooikeusryhmatNavigation, '/');
    }

    render() {

        return <div className="wrapper">
            <h3>In progress</h3>
        </div>
    }

}

const mapStateToProps = (state, ownProps) => ({
    updateNavigation,
});


export default connect(mapStateToProps, {updateNavigation})(KayttooikeusryhmatContainer)