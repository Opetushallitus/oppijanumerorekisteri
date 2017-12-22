// @flow
import React from 'react';
import type {Locale} from '../../types/locale.type';
import UserContentContainer from '../common/henkilo/usercontent/UserContentContainer';
import HenkiloViewOrganisationContent from '../common/henkilo/HenkiloViewOrganisationContent'
import HenkiloViewExistingKayttooikeus from "../common/henkilo/HenkiloViewExistingKayttooikeus";
import HenkiloViewExpiredKayttooikeus from "../common/henkilo/HenkiloViewExpiredKayttooikeus";
import HenkiloViewOpenKayttooikeusanomus from "../common/henkilo/HenkiloViewOpenKayttooikeusanomus";
import HenkiloViewCreateKayttooikeus from "../common/henkilo/HenkiloViewCreateKayttooikeus";
import Loader from "../common/icons/Loader";
import HenkiloViewContactContent from "../common/henkilo/HenkiloViewContactContent";
import StaticUtils from '../common/StaticUtils'
import type {L10n} from "../../types/localisation.type";
import HenkiloViewCreateKayttooikeusanomus from "../common/henkilo/HenkiloViewCreateKayttooikeusanomus";
import PropertySingleton from "../../globals/PropertySingleton";
import type {Organisaatio} from "../../types/domain/kayttooikeus/OrganisaatioHenkilo.types";
import type {ReactSelectOption} from "../../types/react-select.types";
import VirheKayttoEstetty from '../virhe/VirheKayttoEstetty';

type Props = {
    l10n: L10n,
    locale: Locale,
    updateHenkiloAndRefetch: (any) => void,
    updateAndRefetchKayttajatieto: (henkiloOid: string, kayttajatunnus: string) => void,
    henkilo: any,
    kayttooikeus: any,
    koodisto: any,
    createBasicInfo: (boolean, (any) => void, (any) => void, any) => any,
    readOnlyButtons: ((any) => void) => any,
    passivoiHenkiloOrg: (henkiloOid: string, organisaatioOid: string) => void,
    organisaatioKayttooikeusryhmat: {kayttooikeusryhmat: Array<any>},
    oidHenkilo: string,
    view: string,
    organisaatios: {
        organisaatiot: {
            organisaatiot: Array<Organisaatio>,
        }
    },
    ryhmas: {
        ryhmas: Array<{nimi: {fi: string, sv: string, en: string,}, oid: string}>,
    },
}

class HenkiloViewPage extends React.Component<Props> {

    existingKayttooikeusRef: any;

    constructor(props: Props) {
        super(props);

        this.existingKayttooikeusRef = {};
    }

    render() {
        if (this.props.henkilo.henkiloKayttoEstetty) {
            return <VirheKayttoEstetty L={this.props.l10n[this.props.locale]} />
        }
        return (
            <div>
                <div className="wrapper">
                    {
                        <UserContentContainer
                            basicInfo={this.props.createBasicInfo}
                            readOnlyButtons={this.props.readOnlyButtons}
                            oidHenkilo={this.props.oidHenkilo}
                            view={this.props.view}
                        />
                    }
                </div>
                {this.props.henkilo.henkilo.henkiloTyyppi !== 'PALVELU' &&
                <div className="wrapper">
                    {
                        this.props.henkilo.henkiloLoading
                        || this.props.koodisto.yhteystietotyypitKoodistoLoading
                            ? <Loader />
                            : <HenkiloViewContactContent {...this.props} readOnly={true} locale={this.props.locale} />
                    }
                </div>
                }
                {this.props.view !== 'OMATTIEDOT' && this.props.view !== 'OPPIJA' && <div className="wrapper">
                    {
                        this.props.henkilo.henkiloOrgsLoading
                            ? <Loader />
                            : <HenkiloViewOrganisationContent {...this.props} readOnly={true} locale={this.props.locale} />
                    }
                </div>}
                {this.props.view !== 'OPPIJA' && <div className="wrapper" ref={(ref) => this.existingKayttooikeusRef = ref}>
                    {
                        this.props.kayttooikeus.kayttooikeusLoading
                            ? <Loader />
                            : <HenkiloViewExistingKayttooikeus
                                {...this.props}
                                vuosia={StaticUtils.getKayttooikeusKestoVuosissa(this.props.henkilo.henkilo)}
                                oidHenkilo={this.props.henkilo.henkilo.oidHenkilo}
                                isOmattiedot={this.props.view === 'OMATTIEDOT'}
                            />
                    }
                </div>}
                {this.props.henkilo.henkilo.henkiloTyyppi !== 'PALVELU' && this.props.view !== 'OPPIJA' &&
                <div className="wrapper">
                    {
                        this.props.kayttooikeus.kayttooikeusAnomusLoading
                            ? <Loader />
                            : <HenkiloViewOpenKayttooikeusanomus
                                {...this.props}
                                isOmattiedot={this.props.view === 'OMATTIEDOT'}
                            />
                    }
                </div>
                }
                {this.props.view !== 'OPPIJA' && <div className="wrapper">
                    {
                        this.props.kayttooikeus.kayttooikeusLoading
                            ? <Loader />
                            : <HenkiloViewExpiredKayttooikeus {...this.props} />
                    }
                </div>}
                {this.props.view !== 'OMATTIEDOT' && this.props.view !== 'OPPIJA'
                && <div className="wrapper">
                    <HenkiloViewCreateKayttooikeus
                        {...this.props}
                        vuosia={StaticUtils.getKayttooikeusKestoVuosissa(this.props.henkilo.henkilo)}
                        existingKayttooikeusRef={this.existingKayttooikeusRef}
                    />
                </div>}
                {this.props.view === 'OMATTIEDOT' && <div className="wrapper">
                    <HenkiloViewCreateKayttooikeusanomus
                        {...this.props}
                        organisaatioOptions={this._parseOrganisaatioOptions.call(this)}
                        ryhmaOptions={this._parseRyhmaOptions.call(this)}
                        kayttooikeusryhmat={this.props.organisaatioKayttooikeusryhmat.kayttooikeusryhmat}
                    />
                </div>}
            </div>
        )
    }

    _parseOrganisaatioOptions(): Array<ReactSelectOption> {
        const locale = this.props.locale;
        if (this.props.organisaatios && this.props.organisaatios.organisaatiot) {
            return this.props.organisaatios.organisaatiot.organisaatiot
                .map(organisaatio => {
                    const organisaatioName: string = organisaatio.nimi[locale]
                        ? organisaatio.nimi[locale]
                        : organisaatio.nimi.fi || organisaatio.nimi.sv || organisaatio.nimi.en || organisaatio.oid || '';
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
    }

    _parseRyhmaOptions() {
        return this.props.ryhmas ?
            this.props.ryhmas.ryhmas.map(ryhma => ({
                label: ryhma.nimi[this.props.locale] || ryhma.nimi['fi'] || ryhma.nimi['sv'] || ryhma.nimi['en'] || '',
                value: ryhma.oid
            })) : [];
    }

}

export default HenkiloViewPage;