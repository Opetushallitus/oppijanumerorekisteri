import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../store';
import { clearKutsuList, deleteKutsu, fetchKutsus } from '../../actions/kutsu.actions';
import KutsututPage from './KutsututPage';
import { KutsuRead } from '../../types/domain/kayttooikeus/Kutsu.types';
import { L10n } from '../../types/localisation.type';
import { Locale } from '../../types/locale.type';

type OwnProps = {
    location: any;
};

type StateProps = {
    path: string;
    kutsus: { result: Array<KutsuRead> };
    l10n: L10n;
    locale: Locale;
    kutsuListLoading: boolean;
    isAdmin: boolean;
    isOphVirkailija: boolean;
};

type DispatchProps = {
    fetchKutsus: (arg0: any, offset: number, amount: number) => void;
    deleteKutsu: (arg0: number) => void;
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
    isAdmin: state.omattiedot.isAdmin,
    isOphVirkailija: state.omattiedot.isOphVirkailija,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    fetchKutsus,
    deleteKutsu,
    clearKutsuList,
})(KutsututPageContainer);
