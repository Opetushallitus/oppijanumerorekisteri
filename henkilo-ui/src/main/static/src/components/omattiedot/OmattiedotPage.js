// @flow
import React from 'react'
import HenkiloViewUserContent from '../common/henkilo/HenkiloViewUserContent'
import HenkiloViewContactContent from '../common/henkilo/HenkiloViewContactContent'
import HenkiloViewOpenKayttooikeusanomus from "../common/henkilo/HenkiloViewOpenKayttooikeusanomus";
import HenkiloViewExpiredKayttooikeus from "../common/henkilo/HenkiloViewExpiredKayttooikeus";
import HenkiloViewCreateKayttooikeusanomus from "../common/henkilo/HenkiloViewCreateKayttooikeusanomus";
import Loader from "../common/icons/Loader";
import EditButton from "../common/henkilo/buttons/EditButton";
import Etunimet from "../common/henkilo/labelvalues/Etunimet";
import Sukunimi from "../common/henkilo/labelvalues/Sukunimi";
import Syntymaaika from "../common/henkilo/labelvalues/Syntymaaika";
import Hetu from "../common/henkilo/labelvalues/Hetu";
import Kutsumanimi from "../common/henkilo/labelvalues/Kutsumanimi";
import Kansalaisuus from "../common/henkilo/labelvalues/Kansalaisuus";
import Aidinkieli from "../common/henkilo/labelvalues/Aidinkieli";
import Oppijanumero from "../common/henkilo/labelvalues/Oppijanumero";
import Asiointikieli from "../common/henkilo/labelvalues/Asiointikieli";
import Kayttajanimi from "../common/henkilo/labelvalues/Kayttajanimi";
import Sukupuoli from "../common/henkilo/labelvalues/Sukupuoli";
import PasswordButton from "../common/henkilo/buttons/PasswordButton";
import HenkiloViewExistingKayttooikeus from "../common/henkilo/HenkiloViewExistingKayttooikeus";
import PropertySingleton from "../../globals/PropertySingleton";

type Props = {
    henkilo: any,
    locale: string,
    kayttooikeus: any,
    organisaatios: any,
    koodisto: any,
    ryhmas: any,
    l10n: any,
    omattiedot: any,
    updatePassword: () => any,
    updateHenkiloAndRefetch: (any) => void,
    updateAndRefetchKayttajatieto: (henkiloOid: string, kayttajatunnus: string) => void,
    organisaatioKayttooikeusryhmat: any
}

type State = {
    confirmPassivointi: boolean,
    confirmYksilointi: boolean
}


export default class OmattiedotPage extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            confirmPassivointi: false,
            confirmYksilointi: false,
        };
    };

    render() {
        const isUserContentLoading = this.props.henkilo.henkiloLoading || this.props.henkilo.kayttajatietoLoading
            || this.props.koodisto.sukupuoliKoodistoLoading || this.props.koodisto.kieliKoodistoLoading
            || this.props.koodisto.kansalaisuusKoodistoLoading;
        const isContactContentLoading = this.props.henkilo.henkiloLoading || this.props.koodisto.yhteystietotyypitKoodistoLoading;
        const createKayttooikeusanomusLoading = this.props.organisaatios.organisaatioLoading || this.props.ryhmas.ryhmasLoading
            || this.props.henkilo.henkiloLoading;
        return (
            <div>
                <div className="wrapper">
                    {
                        isUserContentLoading ? <Loader /> :
                            <HenkiloViewUserContent {...this.props} readOnly={true} locale={this.props.locale}
                                                    showPassive={false}
                                                    basicInfo={this._createBasicInfo.bind(this)}
                                                    readOnlyButtons={this._readOnlyButtons.bind(this)} />
                    }
                </div>
                <div className="wrapper">
                    {
                        isContactContentLoading ? <Loader /> :
                            <HenkiloViewContactContent {...this.props}
                                                       readOnly={true}
                                                       locale={this.props.locale} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.kayttooikeus.kayttooikeusLoading || this.props.henkilo.henkiloLoading
                            ? <Loader />
                            : <HenkiloViewExistingKayttooikeus {...this.props} isOmattiedot oidHenkilo={this.props.omattiedot.data.oid} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.kayttooikeus.kayttooikeusAnomusLoading
                            ? <Loader />
                            : <HenkiloViewOpenKayttooikeusanomus isOmattiedot={true} {...this.props} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.kayttooikeus.kayttooikeusLoading || this.props.kayttooikeus.kayttooikeusAnomusLoading
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
                                kayttooikeusryhmat={this.props.organisaatioKayttooikeusryhmat.kayttooikeusryhmat}
                                />
                    }
                </div>
            </div>
        )
    };

    _createBasicInfo = (readOnly: boolean, updateModelAction: () => any, updateDateAction: () => any, henkiloUpdate: () => any) => {
        const props = {henkilo: this.props.henkilo, koodisto: this.props.koodisto, readOnly: readOnly,
            updateModelFieldAction: updateModelAction, updateDateFieldAction: updateDateAction,
            L: this.props.l10n[this.props.locale], locale: this.props.locale,};
        return [
            [
                <Etunimet {...props} autofocus={true} />,
                <Sukunimi {...props} />,
                <Syntymaaika {...props} />,
                <Hetu {...props} />,
                <Kutsumanimi {...props} />,
            ],
            [
                <Kansalaisuus {...props} henkiloUpdate={henkiloUpdate} />,
                <Aidinkieli {...props} henkiloUpdate={henkiloUpdate} />,
                <Sukupuoli {...props} />,
                <Oppijanumero {...props} />,
                <Asiointikieli {...props} henkiloUpdate={henkiloUpdate} />,
            ],
            [
                <Kayttajanimi {...props} disabled={false} />,
            ],
        ];
    };

    _parseOrganisaatioOptions(): Array<string> {
        const locale = this.props.locale;
        if(this.props.organisaatios && this.props.organisaatios.organisaatiot) {
            return this.props.organisaatios.organisaatiot.organisaatiot
                .map(organisaatio => {
                    const organisaatioName = organisaatio.nimi[locale] ? organisaatio.nimi[locale] :
                        organisaatio.nimi.en || organisaatio.nimi.fi || organisaatio.nimi.sv || '';
                    const label = organisaatio.oid !== PropertySingleton.getState().rootOrganisaatioOid
                        ? `${organisaatioName} (${organisaatio.organisaatiotyypit.join(',')})`
                        : `${organisaatioName}`;
                    return {
                        label,
                        value: organisaatio.oid
                    };
                });
        }
        return [];
    };

    _parseRyhmaOptions() {
        return this.props.ryhmas ?
            this.props.ryhmas.ryhmas.map(ryhma => ({
                label: ryhma.nimi[this.props.locale],
                value: ryhma.oid
            })) : [];
    };

    _readOnlyButtons(edit: () => mixed) {
        const L = this.props.l10n[this.props.locale];
        return [
            <EditButton editAction={edit} L={L} />,
            <PasswordButton oidHenkilo={this.props.omattiedot.data.oid} L={L} updatePassword={this.props.updatePassword} styles={{ top: '3rem', left: '0', width: '18rem' }}/>
        ];
    };
}

