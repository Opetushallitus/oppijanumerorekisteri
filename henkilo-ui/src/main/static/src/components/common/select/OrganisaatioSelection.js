// @flow
import './OrganisaatioSelection.css';
import React from 'react';
import PropTypes from 'prop-types';
import {toLocalizedText} from '../../../localizabletext';
import OphSelect from './OphSelect';
import createFilterOptions from 'react-select-fast-filter-options';
import {getOrganisaatios} from "../../kutsuminen/OrganisaatioUtilities";
import {connect} from 'react-redux';
import type {L} from "../../../types/l.type";
import type {Locale} from "../../../types/locale.type";
import type {Organisaatio, OrganisaatioHenkilo} from "../../../types/domain/kayttooikeus/OrganisaatioHenkilo.types";

type Props = {
    L: L,
    organisaatios: Array<OrganisaatioHenkilo>,
    selectOrganisaatio: () => any,
    locale: Locale,
    selectedOrganisaatioOid: string,
    isRyhma: boolean,
    placeholder: string,
}

type Option = {value: string, label: string,};

type State = {
    options: Array<Option>,
    filterOptions: any,
}

class OrganisaatioSelection extends React.Component<Props, State> {
    placeholder: string;

    static propTypes = {
        organisaatios: PropTypes.array.isRequired,
        selectOrganisaatio: PropTypes.func.isRequired,
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

        this.state = {
            options: [],
            filterOptions: [],
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.organisaatios.length && this.props.organisaatios.length !== nextProps.organisaatios.length) {
                const newOptions = this.getOrganisationsOrRyhmas(getOrganisaatios(nextProps.organisaatios, this.props.locale))
                    .map(this.mapOrganisaatio.bind(this));
            // update index
            const index = createFilterOptions({options: newOptions});
            this.setState({
                options: newOptions.map((option: {value: string, level: number, label: string}): any => ({
                    ...option,
                    label: <span className={`organisaatio-level-${option.level}`}>{option.label}</span>
                })),
                filterOptions: index,
            });
        }
    }

    render() {
        return <OphSelect className={'organisaatioSelection'}
                          options={this.state.options}
                          filterOptions={this.state.filterOptions}
                          placeholder={this.placeholder}
                          onChange={this.props.selectOrganisaatio}
                          // optionRenderer={this.renderOption.bind(this)}
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

    // renderOption(option) {
    //     // return '\xa0\xa0'.repeat(option.level) + option.label;
    //     return <span className={`organisaatio-level-${option.level}`}
    //                  key={option.key}
    //                  onClick={() => option.selectValue(option.option)}
    //                  onMouseEnter={() => option.focusOption(option.option)}
    //                  style={option.style}>{option.label}</span>;
    // }

    // Filter off organisations or ryhmas depending on isRyhma value.
    getOrganisationsOrRyhmas = (organisaatios: Array<Organisaatio>): Array<Organisaatio> => {
        return this.props.isRyhma
            ? organisaatios.filter(organisaatio => organisaatio.tyypit.indexOf('Ryhma') !== -1)
            : organisaatios.filter(organisaatio => organisaatio.tyypit.indexOf('Ryhma') === -1);
    }
}

const mapStateToProps = (state) => ({
    locale: state.locale,
    L: state.l10n.localisations[state.locale]
});

export default connect(mapStateToProps, {})(OrganisaatioSelection);