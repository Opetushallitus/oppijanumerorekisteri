// @flow
import React from 'react';
import {connect} from 'react-redux';
import LabelValue from "./LabelValue";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";

type Props = {
    henkilo: HenkiloState,
    isError?: boolean,
    readOnly: boolean,
    updateModelFieldAction: (string) => void,
    defaultValue?: string,
}

const Kutsumanimi = (props: Props) => <LabelValue
    readOnly={props.readOnly}
    updateModelFieldAction={props.updateModelFieldAction}
    values={{
        label: 'HENKILO_KUTSUMANIMI',
        value: props.defaultValue || props.henkilo.henkilo.kutsumanimi,
        inputValue: 'kutsumanimi',
        isError: props.isError,
    }}
/>;

const mapStateToProps = state => ({
    henkilo: state.henkilo,
});


export default connect(mapStateToProps, {})(Kutsumanimi);
