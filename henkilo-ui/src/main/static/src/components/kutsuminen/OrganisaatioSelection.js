import React from 'react';
import {toLocalizedText} from '../../localizabletext';
import OphSelect from '../common/select/OphSelect';
import './OrganisaatioSelection.css';
import {getOrganisaatios} from "./OrganisaatioUtilities";


export default class OrganisaatioSelection extends React.Component {

    static propTypes = {
        L: React.PropTypes.object.isRequired,
        organisaatios: React.PropTypes.arrayOf(React.PropTypes.shape({
            organisaatio: React.PropTypes.shape({
                nimi: React.PropTypes.object.isRequired,
                oid: React.PropTypes.string.isRequired,
                parentOidPath: React.PropTypes.string, // Null for root organisation
                tyypit: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
            }).isRequired,
        })).isRequired,
        selectOrganisaatio: React.PropTypes.func,
        locale: React.PropTypes.string.isRequired,
        selectedOrganisaatioName: React.PropTypes.string,
    };

    constructor(props) {
        super(props);

        this.state = {
            options: []
        }
    }

    render() {

        const options = this.state.options.length || this.props.selectedOrganisaatioName === ''
            ? this.state.options
            : getOrganisaatios(this.props.organisaatios, this.props.locale)
                .filter(organisaatio => organisaatio.oid === this.props.selectedOrganisaatioName)
                .map(this.mapOrganisaatio.bind(this));
        return <OphSelect className={'organisaatioSelection'}
                          options={options}
                          placeholder={this.props.L['VIRKAILIJAN_LISAYS_VALITSE_ORGANISAATIO']}
                          onInputChange={this.inputChange.bind(this)}
                          onChange={this.props.selectOrganisaatio}
                          optionRenderer={this.renderOption.bind(this)}
                          value={this.props.selectedOrganisaatioName}
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
            const options = getOrganisaatios(this.props.organisaatios, this.props.locale)
                .filter(organisaatio => organisaatio.fullLocalizedName.indexOf(value) >= 0)
                .map(this.mapOrganisaatio.bind(this));
            this.setState({ options: options })
        } else {
            this.setState({ options: [] });
        }

    }

}