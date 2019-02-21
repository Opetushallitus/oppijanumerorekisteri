// @flow
import React from 'react';
import {connect} from 'react-redux';
import LabelValue from './LabelValue';
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";
import type {ReactSelectOption} from "../../../../types/react-select.types";
import type {Locale} from "../../../../types/locale.type";
import type {Henkilo} from "../../../../types/domain/oppijanumerorekisteri/henkilo.types";
import {fetchSukupuoliKoodisto} from "../../../../actions/koodisto.actions";

type Props = {
    henkilo: HenkiloState,
    koodisto: {
        sukupuoli: Array<ReactSelectOption>,
    },
    locale: Locale,
    henkiloUpdate: Henkilo,
    readOnly: boolean,
    updateModelFieldAction: () => void,
    fetchSukupuoliKoodisto: () => void,
}

class Sukupuoli extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    componentDidMount(): void {
        this.props.fetchSukupuoliKoodisto();
    }

    render() {
        return <LabelValue
            readOnly={this.props.readOnly}
            updateModelFieldAction={this.props.updateModelFieldAction}
            values={{
                label: 'HENKILO_SUKUPUOLI',
                data: this.props.koodisto.sukupuoli.map(koodi => ({value: koodi.value, label: koodi[this.props.locale],
                    optionsName: 'sukupuoli',})),
                selectValue: this.props.henkiloUpdate.sukupuoli,
                disabled: !!this.props.henkiloUpdate.hetu,
            }}
        />;
    }
}


const mapStateToProps = state => ({
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    locale: state.locale,
});

export default connect(mapStateToProps, {fetchSukupuoliKoodisto})(Sukupuoli);
