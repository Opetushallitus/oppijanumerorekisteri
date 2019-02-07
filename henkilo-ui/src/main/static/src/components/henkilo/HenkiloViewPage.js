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
import VirheKayttoEstetty from '../virhe/VirheKayttoEstetty';
import type {OrganisaatioCache, OrganisaatioState} from "../../reducers/organisaatio.reducer";
import { path } from 'ramda';
import type {OmattiedotState} from "../../reducers/omattiedot.reducer";
import type {RyhmatState} from "../../reducers/ryhmat.reducer";
import type {HenkiloState} from "../../reducers/henkilo.reducer";
import type {OrganisaatioKayttooikeusryhmatState} from "../../reducers/organisaatiokayttooikeusryhmat.reducer";
import type {KayttooikeusRyhmaState} from "../../reducers/kayttooikeusryhma.reducer";
import type {KoodistoState} from "../../reducers/koodisto.reducer";

type Props = {
    l10n: L10n,
    locale: Locale,
    updateHenkiloAndRefetch?: (any) => void,
    updateAndRefetchKayttajatieto?: (henkiloOid: string, kayttajatunnus: string) => void,
    henkilo: HenkiloState,
    kayttooikeus: KayttooikeusRyhmaState,
    koodisto: KoodistoState,
    createBasicInfo?: (boolean, (any) => void, (any) => void, any) => any,
    readOnlyButtons?: ((any) => void) => any,
    passivoiHenkiloOrg?: (henkiloOid: string, organisaatioOid: string) => void,
    organisaatioKayttooikeusryhmat?: OrganisaatioKayttooikeusryhmatState,
    omattiedot?: OmattiedotState,
    fetchAllKayttooikeusAnomusForHenkilo?: (string) => void,
    oidHenkilo: string,
    view: string,
    organisaatios?: OrganisaatioState,
    organisaatioCache: OrganisaatioCache,
    ryhmas?: RyhmatState,
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

        const kayttooikeusryhmat: Array<any> = path(['kayttooikeusryhmat'], this.props.organisaatioKayttooikeusryhmat) ? path(['kayttooikeusryhmat'], this.props.organisaatioKayttooikeusryhmat) : [];

        const kayttooikeusState = this.props.kayttooikeus || {};

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
                {this.props.henkilo.kayttaja.kayttajaTyyppi !== 'PALVELU' &&
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
                        kayttooikeusState.kayttooikeusLoading
                            ? <Loader />
                            : <HenkiloViewExistingKayttooikeus
                                {...this.props}
                                vuosia={StaticUtils.getKayttooikeusKestoVuosissa(this.props.henkilo.kayttaja)}
                                oidHenkilo={this.props.henkilo.henkilo.oidHenkilo}
                                isOmattiedot={this.props.view === 'OMATTIEDOT'}
                            />
                    }
                </div>}
                {this.props.henkilo.kayttaja.kayttajaTyyppi !== 'PALVELU' && this.props.view !== 'OPPIJA' &&
                <div className="wrapper">
                    {
                        kayttooikeusState.kayttooikeusAnomusLoading
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
                        kayttooikeusState.kayttooikeusLoading
                            ? <Loader />
                            : <HenkiloViewExpiredKayttooikeus {...this.props}
                                                              oidHenkilo={this.props.henkilo.henkilo.oidHenkilo}
                                                              isOmattiedot={this.props.view === 'OMATTIEDOT'} />
                    }
                </div>}
                {this.props.view !== 'OMATTIEDOT' && this.props.view !== 'OPPIJA'
                && <div className="wrapper">
                    <HenkiloViewCreateKayttooikeus
                        {...this.props}
                        vuosia={StaticUtils.getKayttooikeusKestoVuosissa(this.props.henkilo.kayttaja)}
                        existingKayttooikeusRef={this.existingKayttooikeusRef}
                        isPalvelukayttaja={this.props.henkilo.kayttaja.kayttajaTyyppi === 'PALVELU'}
                    />
                </div>}
                {this.props.view === 'OMATTIEDOT' && <div className="wrapper">
                    <HenkiloViewCreateKayttooikeusanomus
                        {...this.props}
                        ryhmaOptions={this._parseRyhmaOptions.call(this)}
                        kayttooikeusryhmat={kayttooikeusryhmat}
                    />
                </div>}
            </div>
        )
    }

    _parseRyhmaOptions(): Array<{label: string, value: string}> {
        return this.props.ryhmas ?
            this.props.ryhmas.ryhmas.map(ryhma => ({
                label: ryhma.nimi[this.props.locale] || ryhma.nimi['fi'] || ryhma.nimi['sv'] || ryhma.nimi['en'] || '',
                value: ryhma.oid
            })) : [];
    }

}

export default HenkiloViewPage;