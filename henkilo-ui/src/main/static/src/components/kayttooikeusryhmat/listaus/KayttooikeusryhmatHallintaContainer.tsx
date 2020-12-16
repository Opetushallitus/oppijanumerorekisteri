import React from 'react';
import { connect } from 'react-redux';
import { fetchAllKayttooikeusryhma } from '../../../actions/kayttooikeusryhma.actions';
import Loader from '../../common/icons/Loader';
import KayttooikeusryhmatHallintaPage from './KayttooikeusryhmatHallintaPage';
import { Locale } from '../../../types/locale.type';
import { Localisations } from '../../../types/localisation.type';
import { hasAnyPalveluRooli } from '../../../utilities/palvelurooli.util';
import { OmattiedotState } from '../../../reducers/omattiedot.reducer';
import { KayttooikeusRyhmaState } from '../../../reducers/kayttooikeusryhma.reducer';

type OwnProps = {
    router: any;
};

type Props = OwnProps & {
    muokkausoikeus: boolean;
    kayttooikeusryhmat: KayttooikeusRyhmaState;
    fetchAllKayttooikeusryhma: (arg0: boolean) => void;
    locale: Locale;
    L: Localisations;
    omattiedot: OmattiedotState;
};

class KayttooikeusryhmatContainer extends React.Component<Props> {
    componentDidMount() {
        this.props.fetchAllKayttooikeusryhma(true);
    }

    render() {
        return (
            <div className="wrapper">
                {this.props.kayttooikeusryhmat.allKayttooikeusryhmasLoading ? (
                    <Loader />
                ) : (
                    <KayttooikeusryhmatHallintaPage
                        muokkausoikeus={this.props.muokkausoikeus}
                        locale={this.props.locale}
                        L={this.props.L}
                        router={this.props.router}
                        omattiedot={this.props.omattiedot}
                        kayttooikeusryhmat={this.props.kayttooikeusryhmat.allKayttooikeusryhmas}
                    />
                )}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    muokkausoikeus: hasAnyPalveluRooli(state.omattiedot.organisaatiot, [
        'KOOSTEROOLIENHALLINTA_CRUD',
        'HENKILONHALLINTA_OPHREKISTERI',
        'KAYTTOOIKEUS_REKISTERINPITAJA',
    ]),
    kayttooikeusryhmat: state.kayttooikeus,
    locale: state.locale,
    L: state.l10n.localisations[state.locale],
    omattiedot: state.omattiedot,
});

export default connect<Props, OwnProps>(mapStateToProps, {
    fetchAllKayttooikeusryhma,
})(KayttooikeusryhmatContainer);
