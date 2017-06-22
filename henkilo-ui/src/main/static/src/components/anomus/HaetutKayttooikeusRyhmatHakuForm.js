import React from 'react';
import PropTypes from 'prop-types';
import Field from '../common/field/Field';
import OphSelect from '../common/select/OphSelect'
import BooleanRadioButtonGroup from '../common/radiobuttongroup/BooleanRadioButtonGroup'
import './HaetutKayttooikeusRyhmatHakuForm.css';

class HaetutKayttooikeusRyhmatHakuForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            q: '',
            selectableOrganisaatiot: [],
            naytaKaikki: true,
        };
    }

    render() {
        const L = this.props.l10n[this.props.locale];
        return (
            <form>
                <div className="flex-horizontal flex-align-center">
                    <div className="flex-item-1 haetut-kayttooikeusryhmat-form-item">
                        <Field inputValue={this.state.q}
                               changeAction={this.onChange}
                               placeholder="Hae henkilöä"></Field>
                    </div>
                    <div className="flex-item-1 haetut-kayttooikeusryhmat-form-item">
                        <OphSelect noResultsText={ `${L['SYOTA_VAHINTAAN']} 3 ${L['MERKKIA']}` }
                                   placeholder={L['OMATTIEDOT_ORGANISAATIO']}
                                   onChange={this.organisaatioOnChange}
                                   onBlurResetsInput={false}
                                   options={this.state.selectableOrganisaatiot}
                                   onInputChange={this.organisaatioOnInputChange}
                                   value={this.state.selectedOrganisaatio}></OphSelect>
                    </div>
                    <div className="flex-item-1 haetut-kayttooikeusryhmat-form-item">
                        <BooleanRadioButtonGroup value={this.state.naytaKaikki}
                                                 onChange={this.naytaKaikkiOnChange}
                                                 trueLabel="Näytä kaikki"
                                                 falseLabel="Näytä OPH"></BooleanRadioButtonGroup>
                    </div>
                </div>
            </form>
        );
    }

    onChange = (event) => {
        const q = event.target.value;
        this.setState({q: q});
        if (q.length === 0 || q.length >= 3) {
            this.props.onSubmit({q: q});
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
        this.setState({selectedOrganisaatio: organisaatio, naytaKaikki: true});
        const organisaatioOid = organisaatio.value;
        this.props.onSubmit({organisaatioOids: organisaatioOid});
    }

    naytaKaikkiOnChange = (naytaKaikki) => {
        const organisaatioOids = naytaKaikki ? null : [this.props.rootOrganisaatioOid];
        this.setState({selectedOrganisaatio: null, naytaKaikki: naytaKaikki});
        this.props.onSubmit({organisaatioOids: organisaatioOids});
    }
};

HaetutKayttooikeusRyhmatHakuForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    organisaatiot: PropTypes.array.isRequired,
    rootOrganisaatioOid: PropTypes.string.isRequired,
    locale: PropTypes.string.isRequired,
    l10n: PropTypes.object.isRequired,
};

export default HaetutKayttooikeusRyhmatHakuForm;
