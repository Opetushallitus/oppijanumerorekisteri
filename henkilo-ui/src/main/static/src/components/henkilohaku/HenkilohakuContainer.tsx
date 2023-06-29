import React from 'react';
import HenkilohakuPage from './HenkilohakuPage';
import { connect } from 'react-redux';
import type { RootState } from '../../store';
import Loader from '../common/icons/Loader';
import { fetchAllKayttooikeusryhma } from '../../actions/kayttooikeusryhma.actions';
import { clearHenkilohaku, henkilohaku, henkilohakuCount, updateFilters } from '../../actions/henkilohaku.actions';
import { fetchAllRyhmas } from '../../actions/organisaatio.actions';
import { Locale } from '../../types/locale.type';
import { L10n } from '../../types/localisation.type';
import { HenkiloState } from '../../reducers/henkilo.reducer';
import {
    HenkilohakuCriteria,
    HenkilohakuQueryparameters,
} from '../../types/domain/kayttooikeus/HenkilohakuCriteria.types';
import { HenkilohakuState } from '../../reducers/henkilohaku.reducer';
import { OmattiedotState } from '../../reducers/omattiedot.reducer';
import { parsePalveluRoolit, hasAnyPalveluRooli } from '../../utilities/palvelurooli.util';

type OwnProps = {
    router: any;
};

type StateProps = {
    l10n: L10n;
    locale: Locale;
    allKayttooikeusryhmasLoading: boolean;
    henkilo: HenkiloState;
    henkilohakuState: HenkilohakuState;
    isAdmin: boolean;
    omattiedot: OmattiedotState;
};

type DispatchProps = {
    fetchAllKayttooikeusryhma: () => void;
    fetchAllRyhmas: () => void;
    henkilohaku: (arg0: HenkilohakuCriteria, arg1: HenkilohakuQueryparameters) => void;
    henkilohakuCount: (arg0: HenkilohakuCriteria) => void;
    updateFilters: (arg0: HenkilohakuCriteria) => void;
    clearHenkilohaku: () => void;
};

type Props = OwnProps & StateProps & DispatchProps;

class HenkilohakuContainer extends React.Component<Props> {
    initialCriteria: HenkilohakuCriteria = {
        noOrganisation: false,
        subOrganisation: true,
        passivoitu: false,
        dublicates: false,
    };

    async componentWillMount() {
        const kayttooikeudet = parsePalveluRoolit(this.props.omattiedot.organisaatiot);
        const vainOppijoidenTuonti =
            kayttooikeudet.every(
                (kayttooikeus) =>
                    kayttooikeus.startsWith('OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI') ||
                    (!kayttooikeus.startsWith('OPPIJANUMEROREKISTERI') &&
                        !kayttooikeus.startsWith('KAYTTOOIKEUS') &&
                        !kayttooikeus.startsWith('HENKILONHALLINTA'))
            ) && hasAnyPalveluRooli(this.props.omattiedot.organisaatiot, ['OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI']);
        if (vainOppijoidenTuonti) {
            this.props.router.replace('/oppijoidentuonti');
        }

        this.props.fetchAllKayttooikeusryhma();
        this.props.fetchAllRyhmas();
    }

    render() {
        return !this.props.allKayttooikeusryhmasLoading && !this.props.omattiedot.omattiedotLoading ? (
            <HenkilohakuPage
                l10n={this.props.l10n}
                locale={this.props.locale}
                initialCriteria={this.initialCriteria}
                henkilohakuAction={this.props.henkilohaku}
                henkilohakuCount={this.props.henkilohakuCount}
                henkilohakuResult={this.props.henkilohakuState.result}
                henkilohakuResultCount={this.props.henkilohakuState.resultCount}
                henkiloHakuFilters={this.props.henkilohakuState.filters}
                updateFilters={this.props.updateFilters}
                henkilohakuLoading={this.props.henkilohakuState.henkilohakuLoading}
                clearHenkilohaku={this.props.clearHenkilohaku}
                isAdmin={this.props.isAdmin}
            />
        ) : (
            <Loader />
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    l10n: state.l10n.localisations,
    locale: state.locale,
    henkilo: state.henkilo,
    allKayttooikeusryhmasLoading: state.kayttooikeus.allKayttooikeusryhmasLoading,
    henkilohakuState: state.henkilohakuState,
    isAdmin: state.omattiedot.isAdmin,
    omattiedot: state.omattiedot,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    fetchAllKayttooikeusryhma,
    henkilohaku,
    updateFilters,
    clearHenkilohaku,
    fetchAllRyhmas,
    henkilohakuCount,
})(HenkilohakuContainer);
