import React from 'react'
import dateformat from 'dateformat'
import LabelValue from "./LabelValue"

const Syntymaaika = (props) => <LabelValue {...props} values={{
    label: 'HENKILO_SYNTYMAAIKA',
    inputValue: 'syntymaaika',
    date: true,
    value: dateformat(new Date(props.henkilo.henkilo.syntymaaika), props.L['PVM_FORMAATTI']), }} />;

Syntymaaika.propTypes = {
    L: React.PropTypes.object,
    henkilo: React.PropTypes.shape({henkilo: React.PropTypes.shape({
        syntymaaika: React.PropTypes.string,
    })}),
};

export default Syntymaaika;
