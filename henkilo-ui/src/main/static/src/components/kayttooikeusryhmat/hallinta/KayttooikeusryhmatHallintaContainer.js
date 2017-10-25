// @flow
import React from 'react';
import {connect} from 'react-redux';
import {updateNavigation} from '../../../actions/navigation.actions';
import {kayttooikeusryhmatNavigation} from '../../navigation/navigationconfigurations';
import {fetchAllKayttooikeusryhma} from '../../../actions/kayttooikeusryhma.actions';
import Loader from "../../common/icons/Loader";
import KayttooikeusryhmatHallintaPage from "./KayttooikeusryhmatHallintaPage";
import type {Locale} from "../../../types/locale.type";


type Props = {
    updateNavigation: (Array<any>, string, ?string) => any,
    kayttooikeusryhmat: any,
    fetchAllKayttooikeusryhma: (boolean) => void,
    locale: Locale,
    L: any,
    router: any
}

class KayttooikeusryhmatContainer extends React.Component<Props> {

    componentDidMount() {
        this.props.updateNavigation(kayttooikeusryhmatNavigation, '/hallinta');
        this.props.fetchAllKayttooikeusryhma(true);
    }

    render() {
        const kayttooikeusryhmat: any = this.props.kayttooikeusryhmat.allKayttooikeusryhmas;
        return <div className="wrapper">
            {this.props.kayttooikeusryhmat.allKayttooikeusryhmasLoading ? <Loader/> :
                <KayttooikeusryhmatHallintaPage {...this.props}
                                                kayttooikeusryhmat={kayttooikeusryhmat}></KayttooikeusryhmatHallintaPage>
            }
        </div>
    }

}

const mapStateToProps = (state, ownProps) => ({
    kayttooikeusryhmat: state.kayttooikeus,
    locale: state.locale,
    L: state.l10n.localisations[state.locale]
});

export default connect(mapStateToProps, {updateNavigation, fetchAllKayttooikeusryhma})(KayttooikeusryhmatContainer)