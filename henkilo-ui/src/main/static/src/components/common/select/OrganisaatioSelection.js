// @flow
import './OrganisaatioSelection.css';
import React from 'react';
import PropTypes from 'prop-types';
import OphSelect from './OphSelect';
import {connect} from 'react-redux';
import type {L} from "../../../types/l.type";
import type {Locale} from "../../../types/locale.type";
import type {OrganisaatioHenkilo} from "../../../types/domain/kayttooikeus/OrganisaatioHenkilo.types";

type Option = {
    value: string,
    label: string,
}

type Props = {
    L: L,
    organisaatios: Array<OrganisaatioHenkilo>,
    selectOrganisaatio: () => any,
    locale: Locale,
    selectedOrganisaatioOid: string,
    isRyhma: boolean,
    placeholder: string,
    organisaatioOptions: Array<Option>,
    organisaatioFilter: any,
    ryhmaOptions:  Array<Option>,
    ryhmaFilter: any,
}

type State = {
    options: Array<Option>,
    filterOptions: any,
}

class OrganisaatioSelection extends React.Component<Props, State> {
    placeholder: string;

    static propTypes = {
        organisaatios: PropTypes.array.isRequired,
        selectOrganisaatio: PropTypes.func.isRequired,
        selectedOrganisaatioOid: PropTypes.string.isRequired,
        isRyhma: PropTypes.bool,
        placeholder: PropTypes.string,
    };

    constructor(props: Props) {
        super(props);

        if (this.props.placeholder) {
            this.placeholder = this.props.placeholder;
        }
        else if (this.props.isRyhma) {
            this.placeholder = this.props.L['HENKILO_LISAA_KAYTTOOIKEUDET_RYHMA'];
        }
        else {
            this.placeholder = this.props.L['VIRKAILIJAN_LISAYS_VALITSE_ORGANISAATIO'];
        }
    }

    render() {
        return <OphSelect className={'organisaatioSelection'}
                          options={!this.props.isRyhma ? this.props.organisaatioOptions : this.props.ryhmaOptions}
                          filterOptions={!this.props.isRyhma ? this.props.organisaatioFilter : this.props.ryhmaFilter}
                          placeholder={this.placeholder}
                          onChange={this.props.selectOrganisaatio}
                          value={this.props.selectedOrganisaatioOid}
                          noResultsText={ this.props.L['EI_TULOKSIA']}
                          optionHeight={45} />;
    }

}

const mapStateToProps = (state) => ({
    locale: state.locale,
    L: state.l10n.localisations[state.locale],
    organisaatioOptions: state.omattiedot.organisaatioOptions,
    organisaatioFilter: state.omattiedot.organisaatioOptionsFilter,
    ryhmaOptions: state.omattiedot.organisaatioRyhmaOptions,
    ryhmaFilter: state.omattiedot.organisaatioRyhmaFilter,
});

export default connect(mapStateToProps, {})(OrganisaatioSelection);