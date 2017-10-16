import React from 'react';
import {connect} from 'react-redux';
import {updateNavigation} from '../../../actions/navigation.actions';
import {kayttooikeusryhmatNavigation} from '../../navigation/navigationconfigurations';
import {fetchAllKayttooikeusryhma} from '../../../actions/kayttooikeusryhma.actions';
import Loader from "../../common/icons/Loader";

class KayttooikeusryhmatContainer extends React.Component {

    componentDidMount() {
        this.props.updateNavigation(kayttooikeusryhmatNavigation, '/');
        this.props.fetchAllKayttooikeusryhma();
    }

    render() {

        return <div className="wrapper">
            {this.props.kayttooikeusryhmat.kayttooikeusryhmatLoading ? <Loader/> :
                <ul>
                    {this.props.kayttooikeusryhmat.allKayttooikeusryhmas.map((kayttooikeusryhma, index) =>
                        <li key={kayttooikeusryhma.id}>{index}. {kayttooikeusryhma.name}</li>
                    )}
                </ul>
            }
        </div>
    }

}

const mapStateToProps = (state, ownProps) => ({
    kayttooikeusryhmat: state.kayttooikeus
});


export default connect(mapStateToProps, {updateNavigation, fetchAllKayttooikeusryhma})(KayttooikeusryhmatContainer)