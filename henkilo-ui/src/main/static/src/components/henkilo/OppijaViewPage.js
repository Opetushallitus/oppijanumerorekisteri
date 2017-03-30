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
        return {
        }
    },
    render: function() {
        return (
            <div>
                <div className="wrapper">
                    {
                        this._isUserContentLoading(this)
                            ? this.L['LADATAAN']
                            : <HenkiloViewUserContent {...this.props} readOnly={true} locale={locale} showPassive={false}
                        basicInfo={this._createBasicInfo(this.props.henkilo.henkilo, this)}
                                                      basicInfo2={this._createBasicInfo2(this.props.henkilo.henkilo, this)}
                                                      loginInfo={this._createLoginInfo(this.props.henkilo.kayttajatieto)} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this._isContactContentLoading(this)
                            ? this.L['LADATAAN']
                            : <HenkiloViewContactContent {...this.props} readOnly={true} locale={locale} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.henkilo.henkiloOrgsLoading
                            ? this.L['LADATAAN']
                            : <HenkiloViewOrganisationContent {...this.props} readOnly={true} locale={locale} />
                    }
                </div>
            </div>
        )
    },
    _isUserContentLoading: (_this) => _this.props.henkilo.henkiloLoading || _this.props.henkilo.kayttajatietoLoading
    || _this.props.koodisto.sukupuoliKoodistoLoading || _this.props.koodisto.kieliKoodistoLoading
    || _this.props.koodisto.kansalaisuusKoodistoLoading,
    _isContactContentLoading: (_this) => _this.props.henkilo.henkiloLoading || _this.props.koodisto.yhteystietotyypitKoodistoLoading,
    _createBasicInfo: (henkiloUpdate, _this) => ([
        {label: 'HENKILO_ETUNIMET', value: henkiloUpdate.etunimet, inputValue: 'etunimet', autoFocus: true},
        {label: 'HENKILO_SUKUNIMI', value: henkiloUpdate.sukunimi, inputValue: 'sukunimi'},
        {label: 'HENKILO_SYNTYMAAIKA', inputValue: 'syntymaaika', date: true,
            value: dateformat(new Date(henkiloUpdate.syntymaaika), _this.L['PVM_FORMAATTI']), },
        {label: 'HENKILO_HETU', value: henkiloUpdate.hetu, inputValue: 'hetu'},
        {label: 'HENKILO_KUTSUMANIMI', value: henkiloUpdate.kutsumanimi, inputValue: 'kutsumanimi'},
    ]),
    _createBasicInfo2: (henkiloUpdate, _this) => ([
        henkiloUpdate.kansalaisuus && henkiloUpdate.kansalaisuus.length
            ? henkiloUpdate.kansalaisuus.map((values, idx) => ({label: 'HENKILO_KANSALAISUUS',
            data: _this.props.koodisto.kansalaisuus.map(koodi => ({id: koodi.value, text: koodi[_this.props.locale]})),
            value: _this.props.koodisto.kansalaisuus.filter(kansalaisuus =>
            kansalaisuus.value === values.kansalaisuusKoodi)[0][_this.props.locale],
            inputValue: 'kansalaisuus.' + idx + '.kansalaisuusKoodi',
            selectValue: values.kansalaisuusKoodi
        })).reduce((a,b) => a.concat(b))
            : {label: 'HENKILO_KANSALAISUUS',
            data: _this.props.koodisto.kansalaisuus.map(koodi => ({id: koodi.value, text: koodi[_this.props.locale]})),
            inputValue: 'kansalaisuus.0.kansalaisuusKoodi',
            value: null},

        {label: 'HENKILO_AIDINKIELI',
            data: _this.props.koodisto.kieli.map(koodi => ({id: koodi.value, text: koodi[_this.props.locale]})),
            inputValue: 'aidinkieli.kieliKoodi',
            value: henkiloUpdate.aidinkieli && _this.props.koodisto.kieli.filter(kieli =>
            kieli.value === henkiloUpdate.aidinkieli.kieliKoodi)[0][_this.props.locale],
            selectValue: henkiloUpdate.aidinkieli && henkiloUpdate.aidinkieli.kieliKoodi},
        {label: 'HENKILO_SUKUPUOLI',
            data: _this.props.koodisto.sukupuoli.map(koodi => ({id: koodi.value, text: koodi[_this.props.locale]})),
            inputValue: 'sukupuoli',
            value: henkiloUpdate.sukupuoli && _this.props.koodisto.sukupuoli.filter(sukupuoli =>
            sukupuoli.value === henkiloUpdate.sukupuoli)[0][_this.props.locale],
            selectValue: henkiloUpdate.sukupuoli},
        {label: 'HENKILO_OPPIJANUMERO', value: henkiloUpdate.oidHenkilo, inputValue: 'oidHenkilo'},
        {label: 'HENKILO_ASIOINTIKIELI',
            data: _this.props.koodisto.kieli.map(koodi => ({id: koodi.value, text: koodi[_this.props.locale]})),
            inputValue: 'asiointiKieli.kieliKoodi',
            value: henkiloUpdate.asiointiKieli && _this.props.koodisto.kieli.filter(kieli =>
            kieli.value === henkiloUpdate.asiointiKieli.kieliKoodi)[0][_this.props.locale],
            selectValue: henkiloUpdate.asiointiKieli && henkiloUpdate.asiointiKieli.kieliKoodi},
    ]),
    _createLoginInfo: (kayttajatieto) => [
        {label: 'HENKILO_KAYTTAJANIMI', value: kayttajatieto.username, inputValue: 'kayttajanimi'},
        {label: 'HENKILO_PASSWORD', value: null, showOnlyOnWrite: false, inputValue: 'password', password: true},
        {label: 'HENKILO_PASSWORDAGAIN', value: null, showOnlyOnWrite: true, inputValue: 'passwordAgain', password: true},
    ],

});

export default OppijaViewPage;