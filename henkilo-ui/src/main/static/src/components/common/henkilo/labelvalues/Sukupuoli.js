// @flow
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import LabelValue from './LabelValue';
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";

type Props = {
    henkilo: HenkiloState,
    readOnly: boolean,
    updateModelFieldAction: () => void,
}

const Sukupuoli = (props: Props) => <LabelValue
    readOnly={props.readOnly}
    updateModelFieldAction={props.updateModelFieldAction}
    values={{
        label: 'HENKILO_SUKUPUOLI',
        value: props.henkilo.henkilo.sukupuoli,
        inputValue: 'sukupuoli',
        disabled: !!props.henkilo.henkilo.hetu,
    }}
/>;

Sukupuoli.propTypes = {
    henkilo: PropTypes.shape({henkilo: PropTypes.shape({
        sukupuoli: PropTypes.string,
        hetu: PropTypes.string,
    })}),
};

const mapStateToProps = state => ({
    henkilo: state.henkilo,
});

export default connect(mapStateToProps, {})(Sukupuoli);
