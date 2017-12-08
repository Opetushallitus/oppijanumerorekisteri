// @flow
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import LabelValue from './LabelValue';
import StaticUtils from "../../StaticUtils";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";

type Props = {
    henkilo: HenkiloState,
    readOnly: boolean,
    updateModelFieldAction: () => void,
}

const Hetu = (props: Props) => <LabelValue
    readOnly={props.readOnly}
    updateModelFieldAction={props.updateModelFieldAction}
    values={{
        label: 'HENKILO_HETU',
        value: props.henkilo.henkilo.hetu,
        inputValue: 'hetu',
        disabled: StaticUtils.hasHetuAndIsYksiloity(props.henkilo),
    }}
/>;

Hetu.propTypes = {
    henkilo: PropTypes.shape({henkilo: PropTypes.shape({
        hetu: PropTypes.string,
        yksiloityVTJ: PropTypes.bool,
    })}),
};

const mapStateToProps = state => ({
    henkilo: state.henkilo,
});

export default connect(mapStateToProps, {})(Hetu);
