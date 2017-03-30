import './OppijaViewPage.css'
import React from 'react'
import HenkiloViewUserContent from './HenkiloViewUserContent'
import HenkiloViewContactContent from './HenkiloViewContactContent'
import HenkiloViewOrganisationContent from './HenkiloViewOrganisationContent'
import locale from '../../configuration/locale'
import dateformat from 'dateformat'

const OppijaViewPage = React.createClass({
    getInitialState: function () {
        this.L = this.props.l10n[locale];
        this._isUserContentLoading = () => this.props.henkilo.henkiloLoading || this.props.henkilo.kayttajatietoLoading
        || this.props.koodisto.sukupuoliKoodistoLoading || this.props.koodisto.kieliKoodistoLoading
        || this.props.koodisto.kansalaisuusKoodistoLoading;
        this._isContactContentLoading = () => this.props.henkilo.henkiloLoading || this.props.koodisto.yhteystietotyypitKoodistoLoading;
        this._isOrganisatiionContentLoading = () => this.props.henkilo.henkiloOrgsLoading;

        this._createBasicInfo = () => [
            {label: 'HENKILO_ETUNIMET', value: this.props.henkilo.henkilo.etunimet, inputValue: 'etunimet', autoFocus: true},
            {label: 'HENKILO_SUKUNIMI', value: this.props.henkilo.henkilo.sukunimi, inputValue: 'sukunimi'},
            {label: 'HENKILO_SYNTYMAAIKA', inputValue: 'syntymaaika', date: true,
                value: dateformat(new Date(this.props.henkilo.henkilo.syntymaaika), this.L['PVM_FORMAATTI']), },
            {label: 'HENKILO_HETU', value: this.props.henkilo.henkilo.hetu, inputValue: 'hetu'},
            {label: 'HENKILO_KUTSUMANIMI', value: this.props.henkilo.henkilo.kutsumanimi, inputValue: 'kutsumanimi'},
        ];

        this._createBasicInfo2 = () => ([
            this.props.henkilo.henkilo.kansalaisuus && this.props.henkilo.henkilo.kansalaisuus.length
                ? this.props.henkilo.henkilo.kansalaisuus.map((values, idx) => ({label: 'HENKILO_KANSALAISUUS',
                data: this.props.koodisto.kansalaisuus.map(koodi => ({id: koodi.value, text: koodi[this.props.locale]})),
                value: this.props.koodisto.kansalaisuus.filter(kansalaisuus =>
                kansalaisuus.value === values.kansalaisuusKoodi)[0][this.props.locale],
                inputValue: 'kansalaisuus.' + idx + '.kansalaisuusKoodi',
                selectValue: values.kansalaisuusKoodi
            })).reduce((a,b) => a.concat(b))
                : {label: 'HENKILO_KANSALAISUUS',
                data: this.props.koodisto.kansalaisuus.map(koodi => ({id: koodi.value, text: koodi[this.props.locale]})),
                inputValue: 'kansalaisuus.0.kansalaisuusKoodi',
                value: null},

            {label: 'HENKILO_AIDINKIELI',
                data: this.props.koodisto.kieli.map(koodi => ({id: koodi.value, text: koodi[this.props.locale]})),
                inputValue: 'aidinkieli.kieliKoodi',
                value: this.props.henkilo.henkilo.aidinkieli && this.props.koodisto.kieli.filter(kieli =>
                kieli.value === this.props.henkilo.henkilo.aidinkieli.kieliKoodi)[0][this.props.locale],
                selectValue: this.props.henkilo.henkilo.aidinkieli && this.props.henkilo.henkilo.aidinkieli.kieliKoodi},
            {label: 'HENKILO_SUKUPUOLI',
                data: this.props.koodisto.sukupuoli.map(koodi => ({id: koodi.value, text: koodi[this.props.locale]})),
                inputValue: 'sukupuoli',
                value: this.props.henkilo.henkilo.sukupuoli && this.props.koodisto.sukupuoli.filter(sukupuoli =>
                sukupuoli.value === this.props.henkilo.henkilo.sukupuoli)[0][this.props.locale],
                selectValue: this.props.henkilo.henkilo.sukupuoli},
            {label: 'HENKILO_OPPIJANUMERO', value: this.props.henkilo.henkilo.oidHenkilo, inputValue: 'oidHenkilo'},
            {label: 'HENKILO_ASIOINTIKIELI',
                data: this.props.koodisto.kieli.map(koodi => ({id: koodi.value, text: koodi[this.props.locale]})),
                inputValue: 'asiointiKieli.kieliKoodi',
                value: this.props.henkilo.henkilo.asiointiKieli && this.props.koodisto.kieli.filter(kieli =>
                kieli.value === this.props.henkilo.henkilo.asiointiKieli.kieliKoodi)[0][this.props.locale],
                selectValue: this.props.henkilo.henkilo.asiointiKieli && this.props.henkilo.henkilo.asiointiKieli.kieliKoodi},
        ]);
        this._createLoginInfo = () => [
            {label: 'HENKILO_KAYTTAJANIMI', value: this.props.henkilo.kayttajatieto.username, inputValue: 'kayttajanimi'},
            {label: 'HENKILO_PASSWORD', value: null, showOnlyOnWrite: false, inputValue: 'password', password: true},
            {label: 'HENKILO_PASSWORDAGAIN', value: null, showOnlyOnWrite: true, inputValue: 'passwordAgain', password: true},
        ];
        return {
        }
    },
    render: function() {
        return (
            <div>
                <div className="wrapper">
                    {
                        this._isUserContentLoading()
                            ? this.L['LADATAAN']
                            : <HenkiloViewUserContent {...this.props} readOnly={true} locale={locale} showPassive={false}
                        basicInfo={this._createBasicInfo}
                                                      basicInfo2={this._createBasicInfo2}
                                                      loginInfo={this._createLoginInfo} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this._isContactContentLoading()
                            ? this.L['LADATAAN']
                            : <HenkiloViewContactContent {...this.props} readOnly={true} locale={locale} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this._isOrganisatiionContentLoading()
                            ? this.L['LADATAAN']
                            : <HenkiloViewOrganisationContent {...this.props} readOnly={true} locale={locale} />
                    }
                </div>
            </div>
        )
    },
});

export default OppijaViewPage;