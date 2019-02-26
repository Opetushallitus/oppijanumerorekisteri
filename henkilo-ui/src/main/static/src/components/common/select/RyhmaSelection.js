// @flow
import './RyhmaSelection.css';
import React from 'react';
import OphSelect from './OphSelect';
import {connect} from 'react-redux';
import type {Localisations} from "../../../types/localisation.type";
import type {Locale} from "../../../types/locale.type";

type Option = {
    value: string,
    label: string,
}

type Props = {
    L: Localisations,
    selectOrganisaatio: () => any,
    locale: Locale,
    selectedOrganisaatioOid: string,
    placeholder?: string,
    ryhmaOptions:  Array<Option>,
    ryhmaFilter: any,
    clearable?: boolean,
}

class RyhmaSelection extends React.Component<Props> {
    placeholder: string;

    constructor(props: Props) {
        super(props);
        this.placeholder = this.props.placeholder ? this.props.placeholder : this.props.L['HENKILO_LISAA_KAYTTOOIKEUDET_RYHMA'];
    }

    render() {
        const options = this.props.ryhmaOptions;//.sort((a,b) => a.label.props.children.localeCompare(b.label.props.children));
        return <OphSelect className={'organisaatioSelection'}
                          options={options}
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
