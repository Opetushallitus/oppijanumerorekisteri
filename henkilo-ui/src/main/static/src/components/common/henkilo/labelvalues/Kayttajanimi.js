// @flow
import React from 'react';
import {connect} from 'react-redux';
import LabelValue from "./LabelValue";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";

type Props = {
    henkilo: HenkiloState,
    readOnly?: boolean,
    updateModelFieldAction: (string) => void,
    disabled: boolean,
    isError?: boolean,
    defaultValue?: string,
}

const Kayttajanimi = (props: Props) => {
    return <LabelValue
        updateModelFieldAction={props.updateModelFieldAction}
        readOnly={props.readOnly}
        values={{
            label: 'HENKILO_KAYTTAJANIMI',
            value: props.defaultValue || props.henkilo.kayttajatieto.username,
            inputValue: 'kayttajanimi',
            disabled: props.disabled,
            isError: props.isError,
        }}
    />;
};

const mapStateToProps = (state) => ({
    henkilo: state.henkilo,
});

export default connect(mapStateToProps, {})(Kayttajanimi);
