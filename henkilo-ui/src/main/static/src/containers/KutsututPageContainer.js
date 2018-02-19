// @flow

import React from 'react';
import {connect} from 'react-redux';
import {clearKutsuList, deleteKutsu, fetchKutsus} from '../actions/kutsu.actions';
import KutsututPage from '../components/kutsutut/KutsututPage';
import {fetchOmattiedotOrganisaatios} from '../actions/omattiedot.actions';
import type {KutsuRead} from "../types/domain/kayttooikeus/Kutsu.types";
import type {L10n} from "../types/localisation.type";
import type {Locale} from "../types/locale.type";

type Props = {
    path: string,
    kutsus: {result: Array<KutsuRead>},
    l10n: L10n,
    locale: Locale,
    kutsuListLoading: boolean,
    organisaatiot: Array<any>,
    isAdmin: boolean,
    isOphVirkailija: boolean,
    fetchKutsus: (any) => void,
    deleteKutsu: (number) => void,
    fetchOmattiedotOrganisaatios: () => void,
    clearKutsuList: () => void
}

class KutsututPageContainer extends React.Component<Props> {
    render() {
        return <KutsututPage {...this.props} />;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname,
        kutsus: state.kutsuList,
        l10n: state.l10n.localisations,
        locale: state.locale,
        kutsuListLoading: !state.kutsuList.loaded,
        organisaatiot: state.omattiedot.organisaatios,
        isAdmin: state.omattiedot.isAdmin,
        isOphVirkailija: state.omattiedot.isOphVirkailija,
    };
};

export default connect(mapStateToProps, {fetchKutsus, deleteKutsu, fetchOmattiedotOrganisaatios, clearKutsuList})(KutsututPageContainer)
