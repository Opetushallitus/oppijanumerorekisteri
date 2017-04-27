import React from 'react';
import {toLocalizedText} from '../../localizabletext';
import Select from 'react-select';
import './OrganisaatioSelection.css';


export default class OrganisaatioSelection extends React.Component {

    static propTypes = {
        originalOrganisaatios: React.PropTypes.array,
        organisaatios: React.PropTypes.array,
        onSelect: React.PropTypes.func,
        locale: React.PropTypes.string,
        selectedOrganisaatioName: React.PropTypes.string,
        omattiedot: React.PropTypes.object,
        kutsuSetOrganisaatio: React.PropTypes.func,
        fetchKutsujaKayttooikeusForHenkiloInOrganisaatio: React.PropTypes.func
    };

    constructor() {
        super();
        this.state = {
            organisaatioSelection: {
                options: []
            }
        }

    }

    render() {
        return <div>{this.props.selectedOrganisaatioName}
            <Select className={'organisaatioSelection'}
                    options={this.state.organisaatioSelection.options}
                    placeholder={this.props.L['VIRKAILIJAN_LISAYS_VALITSE_ORGANISAATIO']}
                    onInputChange={this.inputChange.bind(this)}
                    onChange={this.props.selectOrganisaatio}
                    value={this.props.selectedOrganisaatioName}
                    noResultsText={ `${this.props.L['SYOTA_VAHINTAAN']} 3 merkkiä` }></Select>
        </div>;
    }

    mapOrganisaatio(organisaatio) {
        const organisaatioNimi = org => toLocalizedText(this.props.locale, organisaatio.nimi);
        return {
            value: organisaatio.oid,
            label: `${organisaatioNimi(organisaatio)} (${organisaatio.tyypit.join(',')})`,
            level: organisaatio.level
        };
    }

    inputChange(value) {
        if (value.length >= 3) {
            const options = this.props.organisaatios
                .filter(organisaatio => organisaatio.fullLocalizedName.indexOf(value) >= 0)
                .map(this.mapOrganisaatio.bind(this));

            this.setState({
                organisaatioSelection: {
                    options: options
                }
            })
        } else {
            this.setState({
                organisaatioSelection: {options: []}
            });
        }

    }

}