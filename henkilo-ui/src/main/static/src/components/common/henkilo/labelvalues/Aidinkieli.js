// @flow
import React from 'react';
import {connect} from 'react-redux';
import LabelValue from './LabelValue';
import StaticUtils from '../../StaticUtils';
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";
import type {ReactSelectOption} from "../../../../types/react-select.types";
import type {Locale} from "../../../../types/locale.type";
import type {Henkilo} from "../../../../types/domain/oppijanumerorekisteri/henkilo.types";

type Props = {
    henkilo: HenkiloState,
    koodisto: {
        kieli: Array<ReactSelectOption>,
    },
    locale: Locale,
    henkiloUpdate: Henkilo,
    readOnly: boolean,
    updateModelFieldAction: () => void,
}

const Aidinkieli = (props: Props) => <LabelValue
    readOnly={props.readOnly}
    updateModelFieldAction={props.updateModelFieldAction}
    values={{
        label: 'HENKILO_AIDINKIELI',
        data: props.koodisto.kieli.map(koodi => ({value: koodi.value, label: koodi[props.locale],
            optionsName: 'aidinkieli.kieliKoodi',})),
        selectValue: props.henkiloUpdate.aidinkieli && props.henkiloUpdate.aidinkieli.kieliKoodi,
        disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
    }}
/>;

const mapStateToProps = state => ({
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    locale: state.locale,
});

export default connect(mapStateToProps, {})(Aidinkieli);
