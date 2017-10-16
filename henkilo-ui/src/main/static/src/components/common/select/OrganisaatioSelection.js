// @flow
import React from 'react';
import {toLocalizedText} from '../../../localizabletext';
import OphSelect from './OphSelect';
import './OrganisaatioSelection.css';
import {getOrganisaatios} from "../../kutsuminen/OrganisaatioUtilities";
import {connect} from 'react-redux';

type Props = {
    L: any,
    organisaatios: Array<any>,
    selectOrganisaatio: () => any,
    locale: string,
    selectedOrganisaatioOid: string,
    isRyhma: boolean
}

type State = {
    options: Array<any>
}

class OrganisaatioSelection extends React.Component<Props, State> {

    constructor(props: any) {
        super(props);



        this.state = {
            options: []
        }
    }

    render() {
        const options = this.state.options.length || this.props.selectedOrganisaatioOid === ''
            ? this.state.options
            : this.getOrganisationsOrRyhmas(getOrganisaatios(this.props.organisaatios, this.props.locale))
                .filter(organisaatio => organisaatio.oid === this.props.selectedOrganisaatioOid)
                .map(this.mapOrganisaatio.bind(this));
        return <OphSelect className={'organisaatioSelection'}
                          options={options}
                          placeholder={this.props.isRyhma
                              ? this.props.L['HENKILO_LISAA_KAYTTOOIKEUDET_RYHMA']
                              : this.props.L['VIRKAILIJAN_LISAYS_VALITSE_ORGANISAATIO']}
                          onInputChange={this.inputChange.bind(this)}
                          onChange={this.props.selectOrganisaatio}
                          optionRenderer={this.renderOption.bind(this)}
                          value={this.props.selectedOrganisaatioOid}
                          noResultsText={ `${this.props.L['SYOTA_VAHINTAAN']} 3 ${this.props.L['MERKKIA']}` } />;
    }

    mapOrganisaatio(organisaatio) {
        const organisaatioNimi = org => toLocalizedText(this.props.locale, organisaatio.nimi);
        return {
            value: organisaatio.oid,
            label: `${organisaatioNimi(organisaatio)} (${organisaatio.tyypit.join(',')})`,
            level: organisaatio.level
        };
    }

    renderOption(option) {
        return (<span className={`organisaatio-level-${option.level}`}>{option.label}</span>)
    }

    inputChange(value) {
        if (value.length >= 3) {
            const options = this.getOrganisationsOrRyhmas(getOrganisaatios(this.props.organisaatios, this.props.locale))
                .filter(organisaatio => organisaatio.fullLocalizedName.toLowerCase().indexOf(value.toLowerCase()) >= 0)
                .map(this.mapOrganisaatio.bind(this));
            this.setState({ options: options })
        } else {
            this.setState({ options: [] });
        }

    }

    // Filter off organisations or ryhmas depending on isRyhma value.
    getOrganisationsOrRyhmas = (organisaatios) => {
        return this.props.isRyhma
            ? organisaatios.filter(organisaatio => organisaatio.tyypit.indexOf('Ryhma') !== -1)
            : organisaatios.filter(organisaatio => organisaatio.tyypit.indexOf('Ryhma') === -1);
    };

}

const mapStateToProps = (state) => ({
    locale: state.locale,
    L: state.l10n.localisations[state.locale]
});

export default connect(mapStateToProps, {})(OrganisaatioSelection);