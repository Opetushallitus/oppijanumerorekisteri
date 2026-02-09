import React, { useState } from 'react';
import { useNavigate } from 'react-router';

import Button from '../../common/button/Button';
import DuplikaatitPerson from './DuplikaatitPerson';
import Loader from '../../common/icons/Loader';
import { enabledDuplikaattiView } from '../../navigation/NavigationTabs';
import { LocalNotification } from '../../common/Notification/LocalNotification';
import type { HenkiloDuplicate } from '../../../types/domain/oppijanumerorekisteri/HenkiloDuplicate';
import { hasAnyPalveluRooli } from '../../../utilities/palvelurooli.util';
import OphModal from '../../common/modal/OphModal';
import {
    useGetHakemuksetQuery,
    useGetHenkiloMasterQuery,
    usePostLinkHenkilosMutation,
} from '../../../api/oppijanumerorekisteri';
import { isHenkiloValidForYksilointi } from '../../../validation/YksilointiValidator';
import { useLocalisations } from '../../../selectors';
import { useGetOmattiedotQuery } from '../../../api/kayttooikeus';
import { HenkiloCreate } from '../../../types/domain/oppijanumerorekisteri/henkilo.types';

import './HenkiloViewDuplikaatit.css';

export type LinkRelation = {
    master: HenkiloDuplicate;
    duplicate: HenkiloDuplicate;
};

type Props = {
    henkilo: HenkiloCreate;
    henkiloType: 'oppija' | 'virkailija';
    vainLuku: boolean;
    duplicates: HenkiloDuplicate[];
    oidHenkilo?: string;
};

const HenkiloViewDuplikaatit = ({ henkilo, vainLuku, henkiloType, duplicates, oidHenkilo }: Props) => {
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { L } = useLocalisations();
    const [linkObj, setLink] = useState<LinkRelation>();
    const [postLinkHenkilos] = usePostLinkHenkilosMutation();
    const { data: masterHenkilo } = useGetHenkiloMasterQuery(oidHenkilo!, { skip: !oidHenkilo });
    const { data: hakemukset } = useGetHakemuksetQuery({ oid: oidHenkilo!, L }, { skip: !oidHenkilo });
    const canForceLink = hasAnyPalveluRooli(omattiedot?.organisaatiot, ['OPPIJANUMEROREKISTERI_YKSILOINNIN_PURKU']);
    const emails: string[] = (henkilo.yhteystiedotRyhma || [])
        .flatMap((ryhma) => ryhma.yhteystieto)
        .filter((yhteysTieto) => yhteysTieto.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI')
        .map((yhteysTieto) => yhteysTieto.yhteystietoArvo);
    const master: HenkiloDuplicate = { ...henkilo, emails };
    const linkingEnabled =
        enabledDuplikaattiView(oidHenkilo, masterHenkilo?.oidHenkilo) || oidHenkilo !== omattiedot?.oidHenkilo;
    const navigate = useNavigate();

    const link = async () => {
        if (!linkObj) {
            return;
        }

        await postLinkHenkilos({
            masterOid: linkObj.master.oidHenkilo!,
            duplicateOids: [linkObj.duplicate.oidHenkilo!],
            L,
            force: !!linkObj.duplicate.yksiloity,
        })
            .unwrap()
            .then(() => {
                setLink(undefined);
                navigate(`/${henkiloType}/${oidHenkilo}`);
            })
            .catch(() => {
                setLink(undefined);
            });
    };

    return (
        <div className="duplicates-view">
            {!duplicates ? <Loader /> : null}
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
                <div className="hakemus">{L['DUPLIKAATIT_HAKIJANOID']}</div>
                <div className="hakemus">{L['DUPLIKAATIT_HAKEMUKSENOID']}</div>
                <div className="hakemus">{L['DUPLIKAATIT_MUUTHAKEMUKSET']}</div>
            </div>
            <DuplikaatitPerson
                henkilo={master}
                hakemukset={hakemukset}
                master={master}
                isMaster={true}
                vainLuku={vainLuku}
                henkiloType={henkiloType}
                canForceLink={canForceLink}
                setLink={setLink}
            />
            {duplicates?.map((duplicate) => (
                <DuplikaatitPerson
                    henkilo={duplicate}
                    hakemukset={duplicate.hakemukset}
                    master={master}
                    key={duplicate.oidHenkilo}
                    isMaster={false}
                    vainLuku={vainLuku}
                    henkiloType={henkiloType}
                    canForceLink={canForceLink}
                    setLink={setLink}
                />
            ))}
            <LocalNotification
                title={L['DUPLIKAATIT_NOTIFICATION_EI_LOYTYNYT']}
                type="info"
                toggle={duplicates?.length === 0}
            />
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
                                <div className="oph-alert-title">{L['DUPLIKAATIT_PUUTTUVAT_TIEDOT_OTSIKKO']}</div>
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
