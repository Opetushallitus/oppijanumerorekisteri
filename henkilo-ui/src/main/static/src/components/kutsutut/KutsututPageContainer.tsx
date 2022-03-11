import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../reducers';
import { clearKutsuList, deleteKutsu, fetchKutsus } from '../../actions/kutsu.actions';
import KutsututPage from './KutsututPage';
import { fetchOmattiedotOrganisaatios } from '../../actions/omattiedot.actions';
import { KutsuRead } from '../../types/domain/kayttooikeus/Kutsu.types';
import { L10n } from '../../types/localisation.type';
import { Locale } from '../../types/locale.type';
import { OrganisaatioHenkilo } from '../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';

type OwnProps = {
    location: any;
};

type StateProps = {
    path: string;
    kutsus: { result: Array<KutsuRead> };
    l10n: L10n;
    locale: Locale;
    kutsuListLoading: boolean;
    organisaatiot: Array<OrganisaatioHenkilo>;
    isAdmin: boolean;
    isOphVirkailija: boolean;
    omattiedotOrganisaatiosLoading: boolean;
};

type DispatchProps = {
    fetchKutsus: (arg0: any, offset: number, amount: number) => void;
    deleteKutsu: (arg0: number) => void;
    fetchOmattiedotOrganisaatios: () => void;
    clearKutsuList: () => void;
};

type Props = OwnProps & StateProps & DispatchProps;

class KutsututPageContainer extends React.Component<Props> {
    render() {
        return <KutsututPage {...this.props} />;
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => ({
    path: ownProps.location.pathname,
    kutsus: state.kutsuList,
    l10n: state.l10n.localisations,
    locale: state.locale,
    kutsuListLoading: !state.kutsuList.loaded,
    organisaatiot: state.omattiedot.organisaatios,
    omattiedotOrganisaatiosLoading: state.omattiedot.omattiedotOrganisaatiosLoading,
    isAdmin: state.omattiedot.isAdmin,
    isOphVirkailija: state.omattiedot.isOphVirkailija,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    fetchKutsus,
    deleteKutsu,
    fetchOmattiedotOrganisaatios,
    clearKutsuList,
})(KutsututPageContainer);
