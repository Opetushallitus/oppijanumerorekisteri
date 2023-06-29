import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../store';
import type { Localisations } from '../../types/localisation.type';
import { setPalvelukayttajatCriteria, fetchPalvelukayttajat } from '../../actions/palvelukayttaja.actions';
import PalvelukayttajaHakuPage from './PalvelukayttajaHakuPage';
import type { PalvelukayttajaCriteria } from '../../types/domain/kayttooikeus/palvelukayttaja.types';
import type { PalvelukayttajatState } from '../../reducers/palvelukayttaja.reducer';
import type { Locale } from '../../types/locale.type';

type StateProps = {
    L: Localisations;
    locale: Locale;
    palvelukayttajat: PalvelukayttajatState;
};

type DispatchProps = {
    setPalvelukayttajatCriteria: (criteria: PalvelukayttajaCriteria) => void;
    fetchPalvelukayttajat: (criteria: PalvelukayttajaCriteria) => void;
};

type Props = StateProps & DispatchProps;

class PalvelukayttajaHakuContainer extends React.Component<Props> {
    render() {
        return (
            <PalvelukayttajaHakuPage
                L={this.props.L}
                locale={this.props.locale}
                onCriteriaChange={this.onCriteriaChange}
                palvelukayttajat={this.props.palvelukayttajat}
            />
        );
    }

    onCriteriaChange = (criteria: PalvelukayttajaCriteria) => {
        this.props.setPalvelukayttajatCriteria(criteria);
        if (criteria.nameQuery || criteria.selection) {
            this.props.fetchPalvelukayttajat(criteria);
        }
    };
}

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
    palvelukayttajat: state.palvelukayttajat,
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapStateToProps, {
    setPalvelukayttajatCriteria,
    fetchPalvelukayttajat,
})(PalvelukayttajaHakuContainer);
