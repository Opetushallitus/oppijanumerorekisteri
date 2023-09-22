import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../store';
import { clearKutsuList, deleteKutsu, fetchKutsus } from '../../actions/kutsu.actions';
import KutsututPage from './KutsututPage';
import { KutsuRead } from '../../types/domain/kayttooikeus/Kutsu.types';
import { L10n } from '../../types/localisation.type';
import { Locale } from '../../types/locale.type';

type StateProps = {
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

type Props = StateProps & DispatchProps;

class KutsututPageContainer extends React.Component<Props> {
    render() {
        return <KutsututPage {...this.props} />;
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    kutsus: state.kutsuList,
    l10n: state.l10n.localisations,
    locale: state.locale,
    kutsuListLoading: !state.kutsuList.loaded,
    isAdmin: state.omattiedot.isAdmin,
    isOphVirkailija: state.omattiedot.isOphVirkailija,
});

export default connect<StateProps, DispatchProps, undefined, RootState>(mapStateToProps, {
    fetchKutsus,
    deleteKutsu,
    clearKutsuList,
})(KutsututPageContainer);
