// @flow
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import LabelValue from "./LabelValue";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";

type Props = {
    henkilo: HenkiloState,
    isError: boolean,
    readOnly: boolean,
    updateModelFieldAction: () => void,
}

const Kutsumanimi = (props: Props) => <LabelValue
    readOnly={props.readOnly}
    updateModelFieldAction={props.updateModelFieldAction}
    values={{
        label: 'HENKILO_KUTSUMANIMI',
        value: props.henkilo.henkilo.kutsumanimi,
        inputValue: 'kutsumanimi',
        isError: props.isError,
    }}
/>;

Kutsumanimi.propTypes = {
    henkilo: PropTypes.shape({henkilo: PropTypes.shape({
        kutsumanimi: PropTypes.string,
    })}),
};

const mapStateToProps = state => ({
    henkilo: state.henkilo,
});


export default connect(mapStateToProps, {})(Kutsumanimi);
