import React from 'react';
import PropTypes from 'prop-types';
import Field from '../common/field/Field';
import OphSelect from '../common/select/OphSelect'
import BooleanRadioButtonGroup from '../common/radiobuttongroup/BooleanRadioButtonGroup'
import './HaetutKayttooikeusRyhmatHakuForm.css';

/**
 * Haettujen käyttöoikeusryhmien hakulomake.
 */
class HaetutKayttooikeusRyhmatHakuForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hakutermi: '',
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
                        <Field inputValue={this.state.hakutermi}
                               changeAction={this.onHakutermiChange}
                               placeholder={L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_HENKILO']}></Field>
                    </div>
                    <div className="flex-item-1 haetut-kayttooikeusryhmat-form-item">
                        <OphSelect noResultsText={ `${L['SYOTA_VAHINTAAN']} 3 ${L['MERKKIA']}` }
                                   placeholder={L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_ORGANISAATIO']}
                                   onChange={this.onOrganisaatioChange}
                                   onBlurResetsInput={false}
                                   options={this.state.selectableOrganisaatiot}
                                   onInputChange={this.onOrganisaatioInputChange}
                                   value={this.state.selectedOrganisaatio}></OphSelect>
                    </div>
                    <div className="flex-item-1 haetut-kayttooikeusryhmat-form-item">
                        <BooleanRadioButtonGroup value={this.state.naytaKaikki}
                                                 onChange={this.onNaytaKaikkiChange}
                                                 trueLabel={L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_NAYTA_KAIKKI']}
                                                 falseLabel={L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_NAYTA_OPH']}></BooleanRadioButtonGroup>
                    </div>
                </div>
            </form>
        );
    }

    onHakutermiChange = (event) => {
        const hakutermi = event.target.value;
        this.setState({hakutermi: hakutermi});
        if (hakutermi.length === 0 || hakutermi.length >= 3) {
            this.props.onSubmit({q: hakutermi});
        }
    }

    onOrganisaatioInputChange = (value) => {
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
        // Select-komponentin käyttämä formaatti
        return {
            label: `${nimi} (${organisaatio.organisaatiotyypit.join(',')})` ,
            value: organisaatio.oid
        };
    }

    onOrganisaatioChange = (organisaatio) => {
        this.setState({selectedOrganisaatio: organisaatio, naytaKaikki: true});
        const organisaatioOid = organisaatio.value;
        this.props.onSubmit({organisaatioOids: organisaatioOid});
    }

    onNaytaKaikkiChange = (naytaKaikki) => {
        const organisaatioOid = naytaKaikki ? null : this.props.rootOrganisaatioOid;
        this.setState({selectedOrganisaatio: null, naytaKaikki: naytaKaikki});
        this.props.onSubmit({organisaatioOids: organisaatioOid});
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
