// @flow
import React from 'react';
import {connect} from 'react-redux';
import LabelValue from './LabelValue';
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";
import type {Henkilo} from "../../../../types/domain/oppijanumerorekisteri/henkilo.types";

type Props = {
    henkilo: HenkiloState,
    readOnly: boolean,
    henkiloUpdate: Henkilo,
    updateDateFieldAction: () => void,
}

const Syntymaaika = (props: Props) => {
    return <LabelValue
        readOnly={props.readOnly}
        updateDateFieldAction={props.updateDateFieldAction}
        values={{
            label: 'HENKILO_SYNTYMAAIKA',
            inputValue: 'syntymaaika',
            date: true,
            value: props.henkiloUpdate.syntymaaika,
            disabled: !!props.henkiloUpdate.hetu,
        }}
    />;
};

const mapStateToProps = state => ({
    henkilo: state.henkilo,
});

export default connect(mapStateToProps, {})(Syntymaaika);
