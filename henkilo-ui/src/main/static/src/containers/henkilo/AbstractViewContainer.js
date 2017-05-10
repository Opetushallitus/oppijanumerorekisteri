import React from 'react'
import Button from "../../components/common/button/Button"
import dateformat from 'dateformat'
import ConfirmButton from "../../components/common/button/ConfirmButton"
import PopupButton from "../../components/common/button/PopupButton"
import HakatunnistePopupContent from "../../components/common/button/HakaPopupContent"
import PasswordPopupContent from "../../components/common/button/PasswordPopupContent";
import OphSelect from '../../components/common/select/OphSelect'
import OrganisaatioSelection from "../../components/kutsuminen/OrganisaatioSelection";

class AbstractViewContainer extends React.Component {

    createKayttooikeusFields(...kayttooikeusFields) {
        return <table>
            <colgroup>
                <col span={1} style={{width: "30%"}} />
                <col span={1} style={{width: "60%"}} />
                <col span={1} style={{width: "10%"}} />
            </colgroup>
            <tbody>
            {kayttooikeusFields}
            </tbody>
        </table>
    };

    _createNotifications(position) {
        return this.props.henkilo.notifications.filter(notification => notification.position === position)
            .map((notification, idx) => <div key={idx}>{this.L[notification.notL10nMessage]}</div>);
    };

    _createPopupErrorMessage(notificationKey) {
        const notification = this.props.henkilo.buttonNotifications[notificationKey];
        return {errorTopic: notification && this.L[notification.notL10nMessage],
            errorText: notification && this.L[notification.notL10nText]};
    };

    static createPopupErrorMessage(notificationKey, henkilo, L) {
        const notification = henkilo.buttonNotifications[notificationKey];
        return {errorTopic: notification && L[notification.notL10nMessage],
            errorText: notification && L[notification.notL10nText]};
    };

    _creatableYhteystietotyypit() {
        return this.props.koodisto.yhteystietotyypit
            .filter(yhteystietotyyppi => ['yhteystietotyyppi4', 'yhteystietotyyppi10', 'yhteystietotyyppi5', 'yhteystietotyyppi9',
                'yhteystietotyyppi12', 'yhteystietotyyppi18', 'yhteystietotyyppi11', 'yhteystietotyyppi8']
                .indexOf(yhteystietotyyppi.value) === -1);
    };

    /*
    * Fields
    * */

    createKayttooikeusKohdeField(organisationData, organisationAction, organisationValue) {
        return <tr key="kayttokohdeField">
            <td>
                <span className="oph-bold">{this.L['HENKILO_LISAA_KAYTTOOIKEUDET_VALITSE']}</span>:
            </td>
            <td>
                <div>
                    <OrganisaatioSelection L={this.L}
                                           organisaatios={organisationData}
                                           selectOrganisaatio={organisationAction}
                                           selectedOrganisaatioOid={organisationValue}
                                           locale={this.props.locale} />
                </div>

                <div>
                    <OrganisaatioSelection L={this.L}
                                           organisaatios={organisationData}
                                           selectOrganisaatio={organisationAction}
                                           selectedOrganisaatioOid={organisationValue}
                                           locale={this.props.locale}
                                           isRyhma={true} />
                </div>
            </td>
            <td>
                <span className="oph-bold">{' ' + this.L['HENKILO_LISAA_KAYTTOOIKEUDET_TAI']}</span>
            </td>
        </tr>;
    };

    createKayttooikeusKestoField(alkaaPvmAction, alkaaInitValue, paattyyPvmAction, paattyyInitValue) {
        return <tr key="kayttooikeusKestoField">
            <td>
                <span className="oph-bold">{this.L['HENKILO_LISAA_KAYTTOOIKEUDET_KESTO']}</span>:
            </td>
            <td>
                <div className="kayttooikeus-input-container">
                    <span className="oph-h5">{this.L['HENKILO_LISAA_KAYTTOOIKEUDET_ALKAA']}</span>
                    <input className="oph-input" defaultValue={dateformat(alkaaInitValue, this.L['PVM_FORMAATTI'])}
                           onChange={alkaaPvmAction} />
                </div>
                <div className="kayttooikeus-input-container">
                    <span className="oph-h5">{this.L['HENKILO_LISAA_KAYTTOOIKEUDET_PAATTYY']}</span>
                    <input className="oph-input" defaultValue={dateformat(paattyyInitValue, this.L['PVM_FORMAATTI'])}
                           onChange={paattyyPvmAction} />
                </div>
            </td>
            <td/>
        </tr>;
    };

    createKayttooikeusKayttooikeudetField(kayttooikeusData, selectedList, kayttooikeusAction, close) {
        const filteredOptions = kayttooikeusData && kayttooikeusData.filter(kayttooikeus =>
            selectedList.indexOf(kayttooikeus.ryhmaId) === -1)
                .map(kayttooikeus => ({
                    value: kayttooikeus.ryhmaId,
                    label: kayttooikeus.ryhmaNames.texts.filter(text => text.lang.toLowerCase() === this.props.locale)[0].text,
                }));
        return <tr key="kayttooikeusKayttooikeudetField">
            <td>
                <span className="oph-bold">{this.L['HENKILO_LISAA_KAYTTOOIKEUDET_MYONNETTAVAT']}</span>:
            </td>
            <td>
                <div>
                    <div>
                        <OphSelect disabled={kayttooikeusData === undefined}
                                   options={filteredOptions}
                                   onChange={kayttooikeusAction} />
                    </div>
                </div>
                <div>
                    {
                        selectedList.map(selected => <div className="oph-alert oph-alert-info">
                            <div className="oph-alert-container">
                                <div className="oph-alert-title">{selected.label}</div>
                                <button className="oph-button oph-button-close"
                                        type="button"
                                        title={this.L['POISTA']}
                                        aria-label="Close" onClick={() => close(selected.value)}>
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                        </div>)
                    }
                </div>
            </td>
            <td />
        </tr>;
    };

    createKayttooikeusHaeButton(haeButtonAction, validationMessages) {
        return <tr key="kayttooikeusHaeButton">
            <td />
            <td>
                <div style={{display: "table-cell"}}>
                <Button id="hae_ko_button" disabled={validationMessages.length > 0} action={haeButtonAction}>
                    {this.L['HENKILO_LISAA_KAYTTOOIKEUDET_HAE_BUTTON']}
                </Button>
                </div>
                <ul style={{display: "table-cell"}}>
                    {
                        validationMessages.map((validationMessage, idx) =>
                            <li key={idx} className="oph-h5">{this.L[validationMessage.label]}</li>
                        )
                    }
                </ul>
            </td>
            <td/>
        </tr>;
    };

    createKansalaisuusField() {
        return this.props.henkilo.henkilo.kansalaisuus && this.props.henkilo.henkilo.kansalaisuus.length
            ? this.props.henkilo.henkilo.kansalaisuus.map((values, idx) =>
                ({
                    label: 'HENKILO_KANSALAISUUS',
                    data: this.props.koodisto.kansalaisuus.map(koodi => ({value: koodi.value, label: koodi[this.props.locale]})),
                    value: this.props.koodisto.kansalaisuus
                        .filter(kansalaisuus => kansalaisuus.value === values.kansalaisuusKoodi)[0][this.props.locale],
                    inputValue: 'kansalaisuus.' + idx + '.kansalaisuusKoodi',
                    selectValue: values.kansalaisuusKoodi
                })).reduce((a,b) => a.concat(b))
            : { label: 'HENKILO_KANSALAISUUS',
                data: this.props.koodisto.kansalaisuus.map(koodi => ({value: koodi.value, label: koodi[this.props.locale]})),
                inputValue: 'kansalaisuus.0.kansalaisuusKoodi',
                value: null };
    };

    createAidinkieliField() {
        return {label: 'HENKILO_AIDINKIELI',
            data: this.props.koodisto.kieli.map(koodi => ({value: koodi.value, label: koodi[this.props.locale]})),
            inputValue: 'aidinkieli.kieliKoodi',
            value: this.props.henkilo.henkilo.aidinkieli && this.props.koodisto.kieli.filter(kieli =>
        kieli.value === this.props.henkilo.henkilo.aidinkieli.kieliKoodi)[0][this.props.locale],
            selectValue: this.props.henkilo.henkilo.aidinkieli && this.props.henkilo.henkilo.aidinkieli.kieliKoodi};
    };

    createSukunimiFieldWithAutofocus() {
        return {label: 'HENKILO_SUKUNIMI', value: this.props.henkilo.henkilo.sukunimi, inputValue: 'sukunimi',
            autoFocus: true, disabled: !!this.props.henkilo.henkilo.hetu && this.props.henkilo.henkilo.yksiloityVTJ};
    };

    createEtunimetField() {
        return {label: 'HENKILO_ETUNIMET', value: this.props.henkilo.henkilo.etunimet, inputValue: 'etunimet',
            disabled: !!this.props.henkilo.henkilo.hetu && this.props.henkilo.henkilo.yksiloityVTJ};
    }

    createSyntymaaikaField() {
        return {label: 'HENKILO_SYNTYMAAIKA', inputValue: 'syntymaaika', date: true,
            value: dateformat(new Date(this.props.henkilo.henkilo.syntymaaika), this.L['PVM_FORMAATTI']), };
    };

    createHetuField() {
        return {label: 'HENKILO_HETU', value: this.props.henkilo.henkilo.hetu, inputValue: 'hetu',
            disabled: !!this.props.henkilo.henkilo.hetu && this.props.henkilo.henkilo.yksiloityVTJ};
    };

    createKutsumanimiField() {
        return  {label: 'HENKILO_KUTSUMANIMI', value: this.props.henkilo.henkilo.kutsumanimi, inputValue: 'kutsumanimi'};
    };

    createOppijanumeroField() {
        return {label: 'HENKILO_OPPIJANUMERO', value: this.props.henkilo.henkilo.oidHenkilo, inputValue: 'oidHenkilo', readOnly: true,};
    };

    createAsiointikieliField() {
        return {label: 'HENKILO_ASIOINTIKIELI',
            data: this.props.koodisto.kieli
                .filter(koodi => ['fi', 'sv', 'en'].indexOf(koodi.value) !== -1)
                .map(koodi => ({value: koodi.value, label: koodi[this.props.locale]})),
            inputValue: 'asiointiKieli.kieliKoodi',
            value: this.props.henkilo.henkilo.asiointiKieli && this.props.koodisto.kieli
                .filter(kieli => kieli.value === this.props.henkilo.henkilo.asiointiKieli.kieliKoodi)[0][this.props.locale],
            selectValue: this.props.henkilo.henkilo.asiointiKieli && this.props.henkilo.henkilo.asiointiKieli.kieliKoodi};
    };

    createKayttajanimiField() {
        return {
            label: 'HENKILO_KAYTTAJANIMI',
            value: this.props.henkilo.kayttajatieto.username,
            inputValue: 'kayttajanimi'
        };
    };

    createTyosahkopostiField(henkiloUpdate) {
        return this._findOrCreateYhteystiedotRyhmaFlat(henkiloUpdate, 'yhteystietotyyppi2', 'YHTEYSTIETO_SAHKOPOSTI', 'HENKILO_TYOSAHKOPOSTI');
    };

    createTyopuhelinField(henkiloUpdate) {
        return this._findOrCreateYhteystiedotRyhmaFlat(henkiloUpdate, 'yhteystietotyyppi2', 'YHTEYSTIETO_PUHELINNUMERO', 'HENKILO_TYOPUHELIN');
    }

    _findOrCreateYhteystiedotRyhmaFlat(henkiloUpdate, ryhmakuvaus, yhteystietotyyppi, label) {
        let yhteystiedotRyhmaIndex = null;
        let yhteystietoIndex = null;
        let tyosahkopostiRyhma = henkiloUpdate.yhteystiedotRyhma
            .filter((yhteystiedotRyhma, idx) => {
                if(!yhteystiedotRyhmaIndex && yhteystiedotRyhma.ryhmaKuvaus === ryhmakuvaus) {
                    yhteystiedotRyhmaIndex = idx;
                    return true;
                }
                return false;
            })[0];
        let tyosahkoposti = tyosahkopostiRyhma
            ? tyosahkopostiRyhma.yhteystieto.filter((yhteystieto, idx) => {
                if(yhteystietoIndex === null && yhteystieto.yhteystietoTyyppi === yhteystietotyyppi) {
                    yhteystietoIndex = idx;
                    return true;
                }
                return false;
            })[0]
            : null;
        if(yhteystiedotRyhmaIndex === null) {
            yhteystiedotRyhmaIndex = henkiloUpdate.yhteystiedotRyhma.length;
            tyosahkopostiRyhma = {
                readOnly: false,
                ryhmaAlkuperaTieto: "alkupera2", // Virkailija
                ryhmaKuvaus: ryhmakuvaus,
                yhteystieto: []
            };
            henkiloUpdate.yhteystiedotRyhma.push(tyosahkopostiRyhma);
        }

        if(yhteystietoIndex === null) {
            yhteystietoIndex = henkiloUpdate.yhteystiedotRyhma[yhteystiedotRyhmaIndex].yhteystieto.length;
            tyosahkoposti = {yhteystietoTyyppi: yhteystietotyyppi, yhteystietoArvo: ''};
            henkiloUpdate.yhteystiedotRyhma[yhteystiedotRyhmaIndex].yhteystieto.push(tyosahkoposti);
        }
        return { label: label,
            value: tyosahkoposti && tyosahkoposti.yhteystietoArvo,
            inputValue: 'yhteystiedotRyhma.'+yhteystiedotRyhmaIndex+'.yhteystieto.'+yhteystietoIndex+'.yhteystietoArvo',
        };
    }
}

export default AbstractViewContainer;
