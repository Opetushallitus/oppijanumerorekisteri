// @flow
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
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
            value: props.henkiloUpdate && props.henkiloUpdate.syntymaaika
                ? moment(new Date(props.henkiloUpdate.syntymaaika)).format()
                : moment().format(),
            disabled: !!props.henkilo.henkilo.hetu,
        }}
    />;
};

Syntymaaika.propTypes = {
    henkilo: PropTypes.shape({henkilo: PropTypes.shape({
            syntymaaika: PropTypes.string,
            hetu: PropTypes.string,
        })}),
};

const mapStateToProps = state => ({
    henkilo: state.henkilo,
});

export default connect(mapStateToProps, {})(Syntymaaika);
