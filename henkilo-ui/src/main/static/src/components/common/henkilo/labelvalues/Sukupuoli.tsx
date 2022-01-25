import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../reducers';
import LabelValue from './LabelValue';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { ReactSelectOption } from '../../../../types/react-select.types';
import { Locale } from '../../../../types/locale.type';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { fetchSukupuoliKoodisto } from '../../../../actions/koodisto.actions';

type OwnProps = {
    henkiloUpdate: Henkilo;
    readOnly: boolean;
    updateModelFieldAction: () => void;
};

type StateProps = {
    henkilo: HenkiloState;
    koodisto: {
        sukupuoli: Array<ReactSelectOption>;
    };
    locale: Locale;
};

type DispatchProps = {
    fetchSukupuoliKoodisto: () => void;
};

type Props = OwnProps & StateProps & DispatchProps;

class Sukupuoli extends React.Component<Props> {
    componentDidMount(): void {
        this.props.fetchSukupuoliKoodisto();
    }

    render() {
        return (
            <LabelValue
                readOnly={this.props.readOnly}
                updateModelFieldAction={this.props.updateModelFieldAction}
                values={{
                    label: 'HENKILO_SUKUPUOLI',
                    data: this.props.koodisto.sukupuoli.map((koodi) => ({
                        value: koodi.value,
                        label: koodi[this.props.locale],
                        optionsName: 'sukupuoli',
                    })),
                    selectValue: this.props.henkiloUpdate.sukupuoli,
                    disabled: !!this.props.henkiloUpdate.hetu,
                }}
            />
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    locale: state.locale,
});

export default connect<StateProps, DispatchProps>(mapStateToProps, {
    fetchSukupuoliKoodisto,
})(Sukupuoli);
