import React from 'react'
import HenkiloViewUserContent from '../common/henkilo/HenkiloViewUserContent'
import HenkiloViewContactContent from '../common/henkilo/HenkiloViewContactContent'
import dateformat from 'dateformat'
import R from 'ramda';
import AbstractViewContainer from '../../containers/henkilo/AbstractViewContainer';
import Button from "../common/button/Button";
import HenkiloViewExistingKayttooikeus from "../common/henkilo/HenkiloViewExistingKayttooikeus";
import HenkiloViewOpenKayttooikeusanomus from "../common/henkilo/HenkiloViewOpenKayttooikeusanomus";
import HenkiloViewExpiredKayttooikeus from "../common/henkilo/HenkiloViewExpiredKayttooikeus";
import HenkiloViewCreateKayttooikeusanomus from "../common/henkilo/HenkiloViewCreateKayttooikeusanomus";
import ConfirmButton from "../common/button/ConfirmButton";
import Loader from "../common/icons/Loader";
import EditButton from "../common/henkilo/buttons/EditButton";

export default class OmattiedotPage extends React.Component {

    constructor() {
        super();

        this.state = {
            confirmPassivointi: false,
            confirmYksilointi: false,
        }
    }

    render() {
        const isUserContentLoading = this.props.henkilo.henkiloLoading || this.props.henkilo.kayttajatietoLoading
            || this.props.koodisto.sukupuoliKoodistoLoading || this.props.koodisto.kieliKoodistoLoading
            || this.props.koodisto.kansalaisuusKoodistoLoading;
        const isContactContentLoading = this.props.henkilo.henkiloLoading || this.props.koodisto.yhteystietotyypitKoodistoLoading;
        const createKayttooikeusanomusLoading = this.props.organisaatios.organisaatioLoading || this.props.ryhmas.ryhmasLoading || this.props.henkilo.henkiloLoading;
        return (
            <div>
                <div className="wrapper">
                    {
                        isUserContentLoading ? <Loader /> :
                            <HenkiloViewUserContent {...this.props} readOnly={true} locale={this.props.locale}
                                                    showPassive={false}
                                                    basicInfo={this._createBasicInfo.bind(this)}
                                                    basicInfo2={this._createBasicInfo2.bind(this)}
                                                    loginInfo={this._createLoginInfo.bind(this)} />
                    }
                </div>
                <div className="wrapper">
                    {
                        isContactContentLoading ? <Loader /> :
                            <HenkiloViewContactContent {...this.props}
                                                       creatableYhteystietotyypit={this._creatableYhteystietotyypit.bind(this)}
                                                       readOnly={true}
                                                       locale={this.props.locale} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.kayttooikeus.kayttooikeusLoading
                            ? <Loader />
                            : <HenkiloViewExistingKayttooikeus {...this.props} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.kayttooikeus.kayttooikeusAnomusLoading
                            ? <Loader />
                            : <HenkiloViewOpenKayttooikeusanomus {...this.props}
                                                                 myonnaButton={this.createMyonnaConfirmButton.bind(this)}
                                                                 hylkaaButton={this.createHylkaaConfirmButton.bind(this)} />
                    }

                </div>
                <div className="wrapper">
                    {
                        this.props.kayttooikeus.kayttooikeusLoading
                            ? <Loader />
                            : <HenkiloViewExpiredKayttooikeus {...this.props} />
                    }
                </div>
                <div className="wrapper">
                    {
                        createKayttooikeusanomusLoading ?
                            <Loader /> :
                            <HenkiloViewCreateKayttooikeusanomus {...this.props}
                                organisaatioOptions={this._parseOrganisaatioOptions.call(this)}
                                ryhmaOptions={this._parseRyhmaOptions.call(this)}
                                kayttooikeusryhmaOptions={this._parseKayttooikeusryhmaOptions.call(this)}></HenkiloViewCreateKayttooikeusanomus>
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
                        value: koodi.value,
                        label: koodi[this.props.locale]
                    })),
                    value: this.props.koodisto.kansalaisuus.filter(kansalaisuus =>
                    kansalaisuus.value === values.kansalaisuusKoodi)[0][this.props.locale],
                    inputValue: 'kansalaisuus.' + idx + '.kansalaisuusKoodi',
                    selectValue: values.kansalaisuusKoodi
                })).reduce((a, b) => a.concat(b))
                : {
                    label: 'HENKILO_KANSALAISUUS',
                    data: this.props.koodisto.kansalaisuus.map(koodi => ({
                        value: koodi.value,
                        label: koodi[this.props.locale]
                    })),
                    inputValue: 'kansalaisuus.0.kansalaisuusKoodi',
                    value: null
                },
            {
                label: 'HENKILO_AIDINKIELI',
                data: this.props.koodisto.kieli.map(koodi => ({value: koodi.value, label: koodi[this.props.locale]})),
                inputValue: 'aidinkieli.kieliKoodi',
                value: this.props.henkilo.henkilo.aidinkieli && this.props.koodisto.kieli.filter(kieli =>
                kieli.value === this.props.henkilo.henkilo.aidinkieli.kieliKoodi)[0][this.props.locale],
                selectValue: this.props.henkilo.henkilo.aidinkieli && this.props.henkilo.henkilo.aidinkieli.kieliKoodi
            },
            {
                label: 'HENKILO_SUKUPUOLI',
                data: this.props.koodisto.sukupuoli.map(koodi => ({value: koodi.value, label: koodi[this.props.locale]})),
                inputValue: 'sukupuoli',
                value: this.props.henkilo.henkilo.sukupuoli && this.props.koodisto.sukupuoli.filter(sukupuoli =>
                sukupuoli.value === this.props.henkilo.henkilo.sukupuoli)[0][this.props.locale],
                selectValue: this.props.henkilo.henkilo.sukupuoli
            },
            {label: 'HENKILO_OPPIJANUMERO', value: this.props.henkilo.henkilo.oidHenkilo, inputValue: 'oidHenkilo'},
            {
                label: 'HENKILO_ASIOINTIKIELI',
                data: this.props.koodisto.kieli.map(koodi => ({value: koodi.value, label: koodi[this.props.locale]})),
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
            {
                label: 'HENKILO_PASSWORD',
                value: null,
                showOnlyOnWrite: false,
                inputValue: 'password', password: true},
            {
                label: 'HENKILO_PASSWORDAGAIN',
                value: null,
                showOnlyOnWrite: true,
                inputValue: 'passwordAgain',
                password: true
            }
        ];
    }

    _parseOrganisaatioOptions() {
        console.log(this.props.organisaatios);
        if(this.props.organisaatios && this.props.organisaatios.organisaatiot) {
            return this.props.organisaatios.organisaatiot.organisaatiot
                .map(organisaatio => {
                    return {
                        label: organisaatio.nimi[this.props.locale] ? organisaatio.nimi[this.props.locale] :
                            organisaatio.nimi.en || organisaatio.nimi.fi || organisaatio.nimi.sv || '',
                        value: organisaatio.oid
                    };
                });
        }
        return [];
    }

    createMyonnaConfirmButton(myonna) {
        return <ConfirmButton action={myonna}
                              confirmLabel={this.L['HENKILO_KAYTTOOIKEUSANOMUS_MYONNA_CONFIRM']}
                              normalLabel={this.L['HENKILO_KAYTTOOIKEUSANOMUS_MYONNA']}
                              key="myonna"
                              errorMessage={this._createPopupErrorMessage('myonna')} />;

    };

    createHylkaaConfirmButton (hylkaa) {
        return <ConfirmButton action={hylkaa}
                              cancel
                              confirmLabel={this.L['HENKILO_KAYTTOOIKEUSANOMUS_HYLKAA_CONFIRM']}
                              normalLabel={this.L['HENKILO_KAYTTOOIKEUSANOMUS_HYLKAA']}
                              key="hylkaa"
                              errorMessage={this._createPopupErrorMessage('hylkaa')} />;
    };

    _parseKayttooikeusryhmaOptions() {
        return this.props.organisaatioKayttooikeusryhmat.kayttooikeusryhmat.map( kayttooikeusryhma => {

            const label = R.find(R.propEq('lang', this.props.locale.toUpperCase()))(kayttooikeusryhma.description.texts);
            return {
                value: kayttooikeusryhma.id,
                label: label.text
            };
        });
    }

    _parseRyhmaOptions() {
        return this.props.ryhmas ?
            this.props.ryhmas.ryhmas.map(ryhma => ({
                label: ryhma.nimi[this.props.locale],
                value: ryhma.oid
            })) : [];
    }

    _readOnlyButtons(edit) {
        const L = this.props.l10n[this.props.locale];
        return [
            <EditButton editAction={edit} L={L} />
        ];
    }

    _creatableYhteystietotyypit() {
        return this.props.koodisto.yhteystietotyypit
            .filter(yhteystietotyyppi => ['yhteystietotyyppi4', 'yhteystietotyyppi10', 'yhteystietotyyppi5', 'yhteystietotyyppi9',
                'yhteystietotyyppi12', 'yhteystietotyyppi18', 'yhteystietotyyppi11', 'yhteystietotyyppi8']
                .indexOf(yhteystietotyyppi.value) === -1);
    };
}

