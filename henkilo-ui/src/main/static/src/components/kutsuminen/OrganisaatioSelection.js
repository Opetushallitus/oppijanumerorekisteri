import React from 'react';
import PropTypes from 'prop-types'
import {toLocalizedText} from '../../localizabletext';
import OphSelect from '../common/select/OphSelect';
import './OrganisaatioSelection.css';
import {getOrganisaatios} from "./OrganisaatioUtilities";


export default class OrganisaatioSelection extends React.Component {

    static propTypes = {
        L: PropTypes.object.isRequired,
        organisaatios: PropTypes.arrayOf(PropTypes.shape({
            organisaatio: PropTypes.shape({
                nimi: PropTypes.object.isRequired,
                oid: PropTypes.string.isRequired,
                parentOidPath: PropTypes.string, // Null for root organisation
                tyypit: PropTypes.arrayOf(PropTypes.string).isRequired,
            }).isRequired,
        })).isRequired,
        selectOrganisaatio: PropTypes.func,
        locale: PropTypes.string.isRequired,
        selectedOrganisaatioOid: PropTypes.string,
        isRyhma: PropTypes.bool,
    };

    constructor(props) {
        super(props);

        // Filter off organisations or ryhmas depending on isRyhma value.
        this.getOrganisationsOrRyhmas = (organisaatios) => {
            return this.props.isRyhma
                ? organisaatios.filter(organisaatio => organisaatio.tyypit.indexOf('Ryhma') !== -1)
                : organisaatios.filter(organisaatio => organisaatio.tyypit.indexOf('Ryhma') === -1);
        };

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

}