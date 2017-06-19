import React from 'react';
import PropTypes from 'prop-types';
import Field from '../common/field/Field';
import OphSelect from '../common/select/OphSelect'

class HaetutKayttooikeusRyhmatHakuForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            q: '',
            selectableOrganisaatiot: []
        };
    }

    render() {
        const L = this.props.l10n[this.props.locale];
        return (
          <form>
              <Field inputValue={this.state.q}
                     changeAction={this.onChange}
                     placeholder="Vähintään kolme merkkiä..."></Field>
              <OphSelect noResultsText={ `${L['SYOTA_VAHINTAAN']} 3 ${L['MERKKIA']}` }
                         placeholder={L['OMATTIEDOT_ORGANISAATIO']}
                         onChange={this.organisaatioOnChange}
                         onBlurResetsInput={false}
                         options={this.state.selectableOrganisaatiot}
                         onInputChange={this.organisaatioOnInputChange}
                         value={this.state.selectedOrganisaatio}></OphSelect>
          </form>
        );
    }

    onChange = (event) => {
        const q = event.target.value;
        this.setState({q: q});
        if (q.length >= 3) {
            this.props.onSubmit({q: this.state.q});
        }
    }

    organisaatioOnInputChange = (value) => {
        if (value.length >= 3) {
            this.setState({selectableOrganisaatiot: this.getSelectableOrganisaatiot(value)});
        } else {
            this.setState({selectableOrganisaatiot: []});
        }
    }

    getSelectableOrganisaatiot = (value) => {
        return this.props.organisaatiot
          .map(this.getOrganisaatioAsSelectable)
          .filter(organisaatio => organisaatio.label.toLowerCase().indexOf(value) >= 0);
    }

    getOrganisaatioAsSelectable = (organisaatio) => {
        const nimi = organisaatio.nimi[this.props.locale] ? organisaatio.nimi[this.props.locale] :
          organisaatio.nimi.en || organisaatio.nimi.fi || organisaatio.nimi.sv || '';
        return {
            label: `${nimi} (${organisaatio.organisaatiotyypit.join(',')})` ,
            value: organisaatio.oid
        };
    }

    organisaatioOnChange = (organisaatio) => {
        this.setState({selectedOrganisaatio: organisaatio});
        const organisaatioOid = organisaatio.value;
        this.props.onSubmit({organisaatioOids: organisaatioOid});
    }
};

HaetutKayttooikeusRyhmatHakuForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    organisaatiot: PropTypes.array.isRequired,
    locale: PropTypes.string.isRequired,
    l10n: PropTypes.object.isRequired,
};

export default HaetutKayttooikeusRyhmatHakuForm;
