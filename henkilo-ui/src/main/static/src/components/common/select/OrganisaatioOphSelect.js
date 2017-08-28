import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import OphSelect from "./OphSelect";

class OrganisaatioOphSelect extends React.Component {
    static propTypes = {
        onOrganisaatioChange: PropTypes.func.isRequired,
        organisaatiot: PropTypes.array.isRequired, // TODO shape
    };

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];

        this.state = {
            selectableOrganisaatiot: [],
        };
    }

    render() {
        return <div>
            <OphSelect noResultsText={ `${this.L['SYOTA_VAHINTAAN']} 3 ${this.L['MERKKIA']}` }
                       placeholder={this.L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_ORGANISAATIO']}
                       onChange={this.props.onOrganisaatioChange}
                       onBlurResetsInput={false}
                       options={this.state.selectableOrganisaatiot}
                       onInputChange={this.onOrganisaatioInputChange}
                       value={this.state.selectedOrganisaatio}/>
        </div>;
    }

    onOrganisaatioInputChange = (value) => {
        if (value.length >= 3) {
            this.setState({selectableOrganisaatiot: this.getSelectableOrganisaatiot(value)});
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
            label: `${nimi} (${organisaatio.organisaatiotyypit.join(',')})` ,
            value: organisaatio.oid
        };
    };

}

const mapStateToProps = (state, ownProps) => ({
    locale: state.locale,
    l10n: state.l10n.localisations,
});

export default connect(mapStateToProps, {})(OrganisaatioOphSelect);
