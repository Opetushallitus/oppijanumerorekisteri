// @flow
import './RyhmaSelection.css';
import React from 'react';
import OphSelect from './OphSelect';
import {connect} from 'react-redux';
import type {L} from "../../../types/localisation.type";
import type {Locale} from "../../../types/locale.type";

type Option = {
    value: string,
    label: string,
}

type Props = {
    L: L,
    selectOrganisaatio: () => any,
    locale: Locale,
    selectedOrganisaatioOid: string,
    placeholder?: string,
    ryhmaOptions:  Array<Option>,
    ryhmaFilter: any,
    clearable?: boolean,
}

type State = {
    options: Array<Option>,
    filterOptions: any,
}

class RyhmaSelection extends React.Component<Props, State> {
    placeholder: string;

    constructor(props: Props) {
        super(props);
        this.placeholder = this.props.placeholder ? this.props.placeholder : this.props.L['HENKILO_LISAA_KAYTTOOIKEUDET_RYHMA'];
    }

    render() {
        return <OphSelect className={'organisaatioSelection'}
                          options={this.props.ryhmaOptions}
                          filterOptions={this.props.ryhmaFilter}
                          placeholder={this.placeholder}
                          onChange={this.props.selectOrganisaatio}
                          value={this.props.selectedOrganisaatioOid}
                          clearable={this.props.clearable}
                          noResultsText={ this.props.L['EI_TULOKSIA']}
                          optionHeight={45}
                          maxHeight={400}/>;
    }
}

const mapStateToProps = (state) => ({
    locale: state.locale,
    L: state.l10n.localisations[state.locale],
    ryhmaOptions: state.omattiedot.organisaatioRyhmaOptions,
    ryhmaFilter: state.omattiedot.organisaatioRyhmaFilter,
});

export default connect(mapStateToProps, {})(RyhmaSelection);
