import React from 'react'
import HenkiloViewUserContent from '../common/henkilo/HenkiloViewUserContent'
import HenkiloViewContactContent from '../common/henkilo/HenkiloViewContactContent'
import dateformat from 'dateformat'
import AbstractViewContainer from '../../containers/henkilo/AbstractViewContainer';
import Button from "../common/button/Button";
import HenkiloViewExistingKayttooikeus from "../common/henkilo/HenkiloViewExistingKayttooikeus";
import HenkiloViewOpenKayttooikeusanomus from "../common/henkilo/HenkiloViewOpenKayttooikeusanomus";
import HenkiloViewExpiredKayttooikeus from "../common/henkilo/HenkiloViewExpiredKayttooikeus";


export default class OmattiedotPage extends React.Component {

    constructor() {
        super();

        this.state = {
            confirmPassivointi: false,
            confirmYksilointi: false,
        }
    }

    render() {
        const L = this.props.l10n[this.props.locale];
        const isUserContentLoading = this.props.henkilo.henkiloLoading || this.props.henkilo.kayttajatietoLoading
            || this.props.koodisto.sukupuoliKoodistoLoading || this.props.koodisto.kieliKoodistoLoading
            || this.props.koodisto.kansalaisuusKoodistoLoading;
        const isContactContentLoading = this.props.henkilo.henkiloLoading || this.props.koodisto.yhteystietotyypitKoodistoLoading;
        return (
            <div>
                <div className="wrapper">
                    {
                        isUserContentLoading ? L['LADATAAN'] :
                            <HenkiloViewUserContent {...this.props} readOnly={true} locale={this.props.locale}
                                                    showPassive={false}
                                                    basicInfo={this._createBasicInfo.bind(this)}
                                                    basicInfo2={this._createBasicInfo2.bind(this)}
                                                    loginInfo={this._createLoginInfo.bind(this)}
                                                    readOnlyButtons={this._readOnlyButtons.bind(this)}
                                                    editButtons={this._editButtons.bind(this)}/>
                    }
                </div>
                <div className="wrapper">
                    {
                        isContactContentLoading ? L['LADATAAN'] :
                            <HenkiloViewContactContent {...this.props}
                                                       creatableYhteystietotyypit={this._creatableYhteystietotyypit.bind(this)}
                                                       readOnly={true}
                                                       locale={this.props.locale}
                                                       editButtons={this._editButtons.bind(this)}/>
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.kayttooikeus.kayttooikeusLoading
                            ? AbstractViewContainer.createLoader()
                            : <HenkiloViewExistingKayttooikeus {...this.props} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.kayttooikeus.kayttooikeusAnomusLoading
                            ? AbstractViewContainer.createLoader()
                            : <HenkiloViewOpenKayttooikeusanomus {...this.props} />
                    }

                </div>
                <div className="wrapper">
                    {
                        this.props.kayttooikeus.kayttooikeusLoading
                            ? AbstractViewContainer.createLoader()
                            : <HenkiloViewExpiredKayttooikeus {...this.props} />
                    }
                </div>
            </div>
        )
    }

    _createBasicInfo() {
        const L = this.props.l10n[this.props.locale];
        return [
            {
                label: 'HENKILO_ETUNIMET',
                value: this.props.henkilo.henkilo.etunimet,
                inputValue: 'etunimet',
                autoFocus: true
            },
            {label: 'HENKILO_SUKUNIMI', value: this.props.henkilo.henkilo.sukunimi, inputValue: 'sukunimi'},
            {
                label: 'HENKILO_SYNTYMAAIKA', inputValue: 'syntymaaika', date: true,
                value: dateformat(new Date(this.props.henkilo.henkilo.syntymaaika), L['PVM_FORMAATTI']),
            },
            {label: 'HENKILO_HETU', value: this.props.henkilo.henkilo.hetu, inputValue: 'hetu'},
            {label: 'HENKILO_KUTSUMANIMI', value: this.props.henkilo.henkilo.kutsumanimi, inputValue: 'kutsumanimi'},
        ];
    }

    _createBasicInfo2() {
        return [
            this.props.henkilo.henkilo.kansalaisuus && this.props.henkilo.henkilo.kansalaisuus.length
                ? this.props.henkilo.henkilo.kansalaisuus.map((values, idx) => ({
                    label: 'HENKILO_KANSALAISUUS',
                    data: this.props.koodisto.kansalaisuus.map(koodi => ({
                        id: koodi.value,
                        text: koodi[this.props.locale]
                    })),
                    value: this.props.koodisto.kansalaisuus.filter(kansalaisuus =>
                    kansalaisuus.value === values.kansalaisuusKoodi)[0][this.props.locale],
                    inputValue: 'kansalaisuus.' + idx + '.kansalaisuusKoodi',
                    selectValue: values.kansalaisuusKoodi
                })).reduce((a, b) => a.concat(b))
                : {
                    label: 'HENKILO_KANSALAISUUS',
                    data: this.props.koodisto.kansalaisuus.map(koodi => ({
                        id: koodi.value,
                        text: koodi[this.props.locale]
                    })),
                    inputValue: 'kansalaisuus.0.kansalaisuusKoodi',
                    value: null
                },
            {
                label: 'HENKILO_AIDINKIELI',
                data: this.props.koodisto.kieli.map(koodi => ({id: koodi.value, text: koodi[this.props.locale]})),
                inputValue: 'aidinkieli.kieliKoodi',
                value: this.props.henkilo.henkilo.aidinkieli && this.props.koodisto.kieli.filter(kieli =>
                kieli.value === this.props.henkilo.henkilo.aidinkieli.kieliKoodi)[0][this.props.locale],
                selectValue: this.props.henkilo.henkilo.aidinkieli && this.props.henkilo.henkilo.aidinkieli.kieliKoodi
            },
            {
                label: 'HENKILO_SUKUPUOLI',
                data: this.props.koodisto.sukupuoli.map(koodi => ({id: koodi.value, text: koodi[this.props.locale]})),
                inputValue: 'sukupuoli',
                value: this.props.henkilo.henkilo.sukupuoli && this.props.koodisto.sukupuoli.filter(sukupuoli =>
                sukupuoli.value === this.props.henkilo.henkilo.sukupuoli)[0][this.props.locale],
                selectValue: this.props.henkilo.henkilo.sukupuoli
            },
            {label: 'HENKILO_OPPIJANUMERO', value: this.props.henkilo.henkilo.oidHenkilo, inputValue: 'oidHenkilo'},
            {
                label: 'HENKILO_ASIOINTIKIELI',
                data: this.props.koodisto.kieli.map(koodi => ({id: koodi.value, text: koodi[this.props.locale]})),
                inputValue: 'asiointiKieli.kieliKoodi',
                value: this.props.henkilo.henkilo.asiointiKieli && this.props.koodisto.kieli.filter(kieli =>
                kieli.value === this.props.henkilo.henkilo.asiointiKieli.kieliKoodi)[0][this.props.locale],
                selectValue: this.props.henkilo.henkilo.asiointiKieli && this.props.henkilo.henkilo.asiointiKieli.kieliKoodi
            },
        ]
    }

    _createLoginInfo() {
        return [
            {
                label: 'HENKILO_KAYTTAJANIMI',
                value: this.props.henkilo.kayttajatieto.username,
                inputValue: 'kayttajanimi'
            },
            {label: 'HENKILO_PASSWORD', value: null, showOnlyOnWrite: false, inputValue: 'password', password: true},
            {
                label: 'HENKILO_PASSWORDAGAIN',
                value: null,
                showOnlyOnWrite: true,
                inputValue: 'passwordAgain',
                password: true
            },
        ];
    }

    _readOnlyButtons(edit) {
        const L = this.props.l10n[this.props.locale];
        return [
            <Button key="edit" big action={edit}>{L['MUOKKAA_LINKKI']}</Button>
        ];
    }

    _creatableYhteystietotyypit() {
        return this.props.koodisto.yhteystietotyypit
            .filter(yhteystietotyyppi => ['yhteystietotyyppi4', 'yhteystietotyyppi10', 'yhteystietotyyppi5', 'yhteystietotyyppi9',
                'yhteystietotyyppi12', 'yhteystietotyyppi18', 'yhteystietotyyppi11', 'yhteystietotyyppi8']
                .indexOf(yhteystietotyyppi.value) === -1);
    };

    _editButtons(discard, update) {
        const L = this.props.l10n[this.props.locale];
        return [
            <Button key="discard" big action={discard}>{L['PERUUTA_LINKKI']}</Button>,
            <Button key="update" confirm big action={update}>{L['TALLENNA_LINKKI']}</Button>
        ];
    }
}

