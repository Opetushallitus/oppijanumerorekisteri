import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { BrowserRouter } from 'react-router';

import { RootState } from '../../../store';
import Button from '../../common/button/Button';
import DuplikaatitPerson from './DuplikaatitPerson';
import Loader from '../../common/icons/Loader';
import { enabledDuplikaattiView } from '../../navigation/NavigationTabs';
import type { Locale } from '../../../types/locale.type';
import type { L10n } from '../../../types/localisation.type';
import { LocalNotification } from '../../common/Notification/LocalNotification';
import { NOTIFICATIONTYPES } from '../../common/Notification/notificationtypes';
import type {
    HenkiloDuplicate,
    HenkiloDuplicateLenient,
} from '../../../types/domain/oppijanumerorekisteri/HenkiloDuplicate';
import type { OmattiedotState } from '../../../reducers/omattiedot.reducer';
import { hasAnyPalveluRooli } from '../../../utilities/palvelurooli.util';
import { Hakemus } from '../../../types/domain/oppijanumerorekisteri/Hakemus.type';
import OphModal from '../../common/modal/OphModal';
import { usePostLinkHenkilosMutation } from '../../../api/oppijanumerorekisteri';

import './HenkiloViewDuplikaatit.css';
import { isHenkiloValidForYksilointi } from '../../../validation/YksilointiValidator';

export type LinkRelation = {
    master: HenkiloDuplicate;
    duplicate: HenkiloDuplicate;
};

type Props = {
    router?: BrowserRouter;
    oidHenkilo?: string;
    henkilo: HenkiloDuplicateLenient & { hakemukset?: Hakemus[] };
    henkiloType: string;
    vainLuku: boolean;
};

const HenkiloViewDuplikaatit = ({ henkilo, vainLuku, henkiloType, router, oidHenkilo }: Props) => {
    const omattiedot = useSelector<RootState, OmattiedotState>((state) => state.omattiedot);
    const l10n = useSelector<RootState, L10n>((state) => state.l10n.localisations);
    const locale = useSelector<RootState, Locale>((state) => state.locale);
    const L = l10n[locale];
    const [linkObj, setLink] = useState<LinkRelation>();
    const [postLinkHenkilos] = usePostLinkHenkilosMutation();
    const canForceLink = hasAnyPalveluRooli(omattiedot.organisaatiot, ['OPPIJANUMEROREKISTERI_YKSILOINNIN_PURKU']);
    const emails = (henkilo.henkilo.yhteystiedotRyhma || [])
        .flatMap((ryhma) => ryhma.yhteystieto)
        .filter((yhteysTieto) => yhteysTieto.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI')
        .map((yhteysTieto) => yhteysTieto.yhteystietoArvo);
    const master: HenkiloDuplicate = { ...henkilo.henkilo, emails, hakemukset: henkilo.hakemukset };
    const linkingEnabled =
        enabledDuplikaattiView(oidHenkilo, henkilo.kayttaja, henkilo.masterLoading, henkilo.master?.oidHenkilo) ||
        oidHenkilo !== omattiedot.data.oid;

    const link = async () =>
        await postLinkHenkilos({
            masterOid: linkObj.master.oidHenkilo,
            duplicateOids: [linkObj.duplicate.oidHenkilo],
            L,
            force: linkObj.duplicate.yksiloity,
        })
            .unwrap()
            .then(() => {
                setLink(undefined);
                router?.push(`/${henkiloType}/${oidHenkilo}`);
            })
            .catch(() => {
                setLink(undefined);
            });

    return (
        <div className="duplicates-view">
            <div className="person header">
                <div />
                <div />
                <div>{L['DUPLIKAATIT_HENKILOTUNNUS']}</div>
                <div>{L['DUPLIKAATIT_YKSILOITY']}</div>
                <div>{L['DUPLIKAATIT_KUTSUMANIMI']}</div>
                <div>{L['DUPLIKAATIT_ETUNIMET']}</div>
                <div>{L['DUPLIKAATIT_SUKUNIMI']}</div>
                <div>{L['DUPLIKAATIT_SUKUPUOLI']}</div>
                <div>{L['DUPLIKAATIT_SYNTYMAAIKA']}</div>
                <div>{L['DUPLIKAATIT_OIDHENKILO']}</div>
                <div>{L['DUPLIKAATIT_SAHKOPOSTIOSOITE']}</div>
                <div>{L['DUPLIKAATIT_PASSINUMERO']}</div>
                <div>{L['DUPLIKAATIT_KANSALAISUUS']}</div>
                <div>{L['DUPLIKAATIT_AIDINKIELI']}</div>
                <div />
                <div className="hakemus">{L['DUPLIKAATIT_KANSALAISUUS']}</div>
                <div className="hakemus">{L['DUPLIKAATIT_AIDINKIELI']}</div>
                <div className="hakemus">{L['DUPLIKAATIT_MATKAPUHELINNUMERO']}</div>
                <div className="hakemus">{L['DUPLIKAATIT_SAHKOPOSTIOSOITE']}</div>
                <div className="hakemus">{L['DUPLIKAATIT_OSOITE']}</div>
                <div className="hakemus">{L['DUPLIKAATIT_POSTINUMERO']}</div>
                <div className="hakemus">{L['DUPLIKAATIT_PASSINUMERO']}</div>
                <div className="hakemus">{L['DUPLIKAATIT_KANSALLINENID']}</div>
                <div className="hakemus">{L['DUPLIKAATIT_HAKEMUKSENTILA']}</div>
                <div className="hakemus">{L['DUPLIKAATIT_HAKEMUKSENOID']}</div>
                <div className="hakemus">{L['DUPLIKAATIT_MUUTHAKEMUKSET']}</div>
            </div>
            <DuplikaatitPerson
                henkilo={master}
                master={master}
                isMaster={true}
                vainLuku={vainLuku}
                henkiloType={henkiloType}
                canForceLink={canForceLink}
                setLink={setLink}
            />
            {henkilo.duplicates.map((duplicate) => (
                <DuplikaatitPerson
                    henkilo={duplicate}
                    master={master}
                    key={duplicate.oidHenkilo}
                    isMaster={false}
                    vainLuku={vainLuku}
                    henkiloType={henkiloType}
                    canForceLink={canForceLink}
                    setLink={setLink}
                />
            ))}
            {henkilo.duplicatesLoading ? <Loader /> : null}
            <LocalNotification
                title={L['DUPLIKAATIT_NOTIFICATION_EI_LOYTYNYT']}
                type={NOTIFICATIONTYPES.INFO}
                toggle={!henkilo.duplicates}
            ></LocalNotification>
            {linkObj && linkingEnabled && (
                <OphModal
                    onClose={() => setLink(undefined)}
                    onOverlayClick={() => setLink(undefined)}
                    title={L['DUPLIKAATIT_VARMISTUS_OTSIKKO']}
                >
                    <p className="duplicate_confirm_p">{L['DUPLIKAATIT_OLETKO_VARMA']}</p>
                    <p className="duplicate_confirm_p">{`- ${L['DUPLIKAATIT_OPPIJANUMERO']} ${
                        linkObj.master.oidHenkilo
                    } (${linkObj.master.sukunimi}, ${linkObj.master.kutsumanimi ?? linkObj.master.etunimet}) ${
                        L['DUPLIKAATIT_JAA_VOIMAAN']
                    }`}</p>
                    <p className="duplicate_confirm_p">
                        {`- ${L['DUPLIKAATIT_OPPIJA']} ${linkObj.duplicate.oidHenkilo} ${
                            L['DUPLIKAATIT_PASSIVOIDAAN']
                        } ${linkObj.duplicate.yksiloity ? L['DUPLIKAATIT_PURETAAN_YKSILOINTI'] : ''} `}
                    </p>
                    {!isHenkiloValidForYksilointi(linkObj.master) && (
                        <div className="oph-alert oph-alert-info">
                            <div className="oph-alert-container">
                                <div className="oph-alert-title">
                                    {L['DUPLIKAATIT_PUUTTUVAT_TIEDOT_OTSIKKO']}
                                </div>
                                <div className="oph-alert-text">{L['DUPLIKAATIT_PUUTTUVAT_TIEDOT_TEKSTI']}</div>
                            </div>
                        </div>
                    )}
                    <div className="duplicate_confirm_buttons">
                        <Button action={() => link()} dataTestId="confirm-force-link">
                            {L['DUPLIKAATIT_VARMISTUS_YHDISTA']}
                        </Button>
                        <Button action={() => setLink(undefined)}>{L['DUPLIKAATIT_VARMISTUS_PERUUTA']}</Button>
                    </div>
                </OphModal>
            )}
        </div>
    );
};

export default HenkiloViewDuplikaatit;
