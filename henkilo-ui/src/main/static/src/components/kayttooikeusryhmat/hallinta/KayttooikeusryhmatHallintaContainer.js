import React from 'react';
import {connect} from 'react-redux';
import {updateNavigation} from '../../../actions/navigation.actions';
import {kayttooikeusryhmatNavigation} from '../../navigation/navigationconfigurations';
import {fetchAllKayttooikeusryhma} from '../../../actions/kayttooikeusryhma.actions';
import {linkHenkilos} from "../../../actions/henkilo.actions";

class KayttooikeusryhmatContainer extends React.Component {

    componentDidMount() {
        this.props.updateNavigation(kayttooikeusryhmatNavigation, '/');
        this.props.fetchAllKayttooikeusryhma();
    }

    render() {

        return <div className="wrapper">
            <ul>
                {this.props.kayttooikeusryhmat.map( (kayttooikeusryhma, index) =>
                    <li key={kayttooikeusryhma.id}>{index}. {kayttooikeusryhma§.name}</li>
                )}
            </ul>
        </div>
    }

}

const mapStateToProps = (state, ownProps) => ({
    updateNavigation,
    kayttooikeusryhmat: state.kayttooikeus.allKayttooikeusryhmas
});


export default connect(mapStateToProps, {updateNavigation, fetchAllKayttooikeusryhma})(KayttooikeusryhmatContainer)