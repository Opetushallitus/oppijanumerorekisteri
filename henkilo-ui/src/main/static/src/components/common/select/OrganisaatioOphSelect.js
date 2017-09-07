import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import OphSelect from "./OphSelect";
import StaticUtils from "../StaticUtils";

class OrganisaatioOphSelect extends React.Component {
    static propTypes = {
        onOrganisaatioChange: PropTypes.func.isRequired,
        organisaatiot: PropTypes.arrayOf(PropTypes.shape({
            oid: PropTypes.string.isRequired,
            organisaatiotyypit: PropTypes.array,
            nimi: PropTypes.shape({
                en: PropTypes.string,
                fi: PropTypes.string,
                sv: PropTypes.string,
            }),
        }).isRequired).isRequired,
    };

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];

        this.state = {
            selectableOrganisaatiot: [],
            selectedOrganisaatio: '',
        };
    }

    render() {
        return <div>
            <OphSelect noResultsText={ `${this.L['SYOTA_VAHINTAAN']} 3 ${this.L['MERKKIA']}` }
                       placeholder={this.L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_ORGANISAATIO']}
                       onChange={this.onOrganisaatioChange.bind(this)}
                       onBlurResetsInput={false}
                       options={this.state.selectableOrganisaatiot}
                       onInputChange={this.onOrganisaatioInputChange}
                       value={this.state.selectedOrganisaatio}/>
        </div>;
    }

    onOrganisaatioChange(organisaatio) {
        this.setState({selectedOrganisaatio: organisaatio.value});
        this.props.onOrganisaatioChange(organisaatio);
    }

    onOrganisaatioInputChange = (value) => {
        if (value.length >= 3) {
            this.setState({selectableOrganisaatiot: this.getSelectableOrganisaatiot(value.toLowerCase())});
        } else {
            this.setState({selectableOrganisaatiot: []});
        }
    };

    getSelectableOrganisaatiot = (value) => {
        return this.props.organisaatiot
            .map(this.getOrganisaatioAsSelectable)
            .filter(organisaatio => organisaatio.label.toLowerCase().indexOf(value) >= 0);
    };

    getOrganisaatioAsSelectable = (organisaatio) => {
        const nimi = organisaatio.nimi[this.props.locale] ? organisaatio.nimi[this.props.locale] :
            organisaatio.nimi.en || organisaatio.nimi.fi || organisaatio.nimi.sv || '';
        // Select-komponentin käyttämä formaatti
        return {
            label: nimi + ' ' + StaticUtils.getOrganisaatiotyypitFlat(organisaatio.organisaatiotyypit, this.L) ,
            value: organisaatio.oid
        };
    };

}

const mapStateToProps = (state, ownProps) => ({
    locale: state.locale,
    l10n: state.l10n.localisations,
});

export default connect(mapStateToProps, {})(OrganisaatioOphSelect);
