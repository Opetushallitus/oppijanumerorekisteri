/**
 * Haettujen käyttöoikeusryhmien hakulomake.
 */
import React from 'react';
import PropTypes from 'prop-types';
import BooleanRadioButtonGroup from '../common/radiobuttongroup/BooleanRadioButtonGroup'
import './HaetutKayttooikeusRyhmatHakuForm.css';
import DelayedSearchInput from "../henkilohaku/DelayedSearchInput";
import OrganisaatioOphSelect from "../common/select/OrganisaatioOphSelect";

class HaetutKayttooikeusRyhmatHakuForm extends React.Component {
    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];

        this.state = {
            hakutermi: '',
            selectableOrganisaatiot: [],
            naytaKaikki: false,
        };
    };

    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
        locale: PropTypes.string.isRequired,
        l10n: PropTypes.array.isRequired,
        organisaatiot: PropTypes.array.isRequired,
        haetutKayttooikeusryhmatLoading: PropTypes.bool.isRequired,
    };

    render() {
        return (
            <form>
                <div className="flex-horizontal flex-align-center">
                    <div className="flex-item-1 haetut-kayttooikeusryhmat-form-item">
                        <DelayedSearchInput setSearchQueryAction={this.onHakutermiChange.bind(this)}
                                            defaultNameQuery={this.state.searchTerm}
                                            placeholder={this.L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_HENKILO']}
                                            loading={this.props.haetutKayttooikeusryhmatLoading} />
                    </div>
                    <div className="flex-item-1 haetut-kayttooikeusryhmat-form-item">
                        <OrganisaatioOphSelect onOrganisaatioChange={this.onOrganisaatioChange.bind(this)}
                                               organisaatiot={this.props.organisaatiot} />
                    </div>
                    <div className="flex-item-1 haetut-kayttooikeusryhmat-form-item">
                        <BooleanRadioButtonGroup value={this.state.naytaKaikki}
                                                 onChange={this.onNaytaKaikkiChange}
                                                 trueLabel={this.L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_NAYTA_KAIKKI']}
                                                 falseLabel={this.L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_NAYTA_OPH']}/>
                    </div>
                </div>
            </form>
        );
    }

    onHakutermiChange = (event) => {
        const hakutermi = event.value;
        this.setState({searchTerm: hakutermi});
        if (hakutermi.length === 0 || hakutermi.length >= 3) {
            this.props.onSubmit({q: hakutermi});
        }
    };

    onOrganisaatioChange = (organisaatio) => {
        this.setState({selectedOrganisaatio: organisaatio, naytaKaikki: true});
        const organisaatioOid = organisaatio.value;
        this.props.onSubmit({organisaatioOids: organisaatioOid});
    };

    onNaytaKaikkiChange = (naytaKaikki) => {
        this.setState({selectedOrganisaatio: null, naytaKaikki: naytaKaikki});
        this.props.onSubmit({adminView: !naytaKaikki});
    };
}

HaetutKayttooikeusRyhmatHakuForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    organisaatiot: PropTypes.array.isRequired,
    rootOrganisaatioOid: PropTypes.string.isRequired,
    locale: PropTypes.string.isRequired,
    l10n: PropTypes.object.isRequired,
};

export default HaetutKayttooikeusRyhmatHakuForm;
