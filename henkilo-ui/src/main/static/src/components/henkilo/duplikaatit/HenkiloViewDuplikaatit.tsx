import React, { useState } from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../../store';
import Button from '../../common/button/Button';
import DuplikaatitPerson from './DuplikaatitPerson';
import Loader from '../../common/icons/Loader';
import { enabledDuplikaattiView } from '../../navigation/NavigationTabs';
import type { Locale } from '../../../types/locale.type';
import type { Localisations } from '../../../types/localisation.type';
import type { KoodistoState } from '../../../reducers/koodisto.reducer';
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

export type LinkRelation = {
    master: HenkiloDuplicate;
    duplicate: HenkiloDuplicate;
};

type OwnProps = {
    router?: any;
    oidHenkilo?: string;
    henkilo: HenkiloDuplicateLenient & { hakemukset?: Hakemus[] };
    henkiloType: string;
    vainLuku: boolean;
};

type StateProps = {
    locale: Locale;
    L: Localisations;
    koodisto: KoodistoState;
    omattiedot: OmattiedotState;
};

type Props = OwnProps & StateProps;

const HenkiloViewDuplikaatit = ({
    henkilo,
    koodisto,
    locale,
    L,
    vainLuku,
    henkiloType,
    router,
    oidHenkilo,
    omattiedot,
}: Props) => {
    const [linkObj, setLink] = useState<LinkRelation>();
    const [postLinkHenkilos] = usePostLinkHenkilosMutation();
    const canForceLink = hasAnyPalveluRooli(omattiedot.organisaatiot, ['OPPIJANUMEROREKISTERI_YKSILOINNIN_PURKU']);
    const emails = (henkilo.henkilo.yhteystiedotRyhma || [])
        .flatMap((ryhma) => ryhma.yhteystieto)
        .filter((yhteysTieto) => yhteysTieto.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI')
        .map((yhteysTieto) => yhteysTieto.yhteystietoArvo);
    const master: HenkiloDuplicate = { ...henkilo.henkilo, emails, hakemukset: henkilo.hakemukset };
    const linkingEnabled =
        enabledDuplikaattiView(oidHenkilo, henkilo.kayttaja, henkilo.masterLoading, henkilo.master.oidHenkilo) ||
        oidHenkilo !== omattiedot.data.oid;

    const link = async () =>
        await postLinkHenkilos({
            masterOid: linkObj.master.oidHenkilo,
            duplicateOids: [linkObj.duplicate.oidHenkilo],
            L,
            force: linkObj.master.yksiloity,
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
            <div id="duplicates">
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
                    koodisto={koodisto}
                    L={L}
                    locale={locale}
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
                        koodisto={koodisto}
                        L={L}
                        locale={locale}
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
            </div>
            {linkObj && linkingEnabled && (
                <OphModal
                    onClose={() => setLink(undefined)}
                    onOverlayClick={() => setLink(undefined)}
                    title={L['DUPLIKAATIT_VARMISTUS_OTSIKKO']}
                >
                    <p className="duplicate_confirm_p">{L['DUPLIKAATIT_VARMISTUS_OLETKO_VARMA']}</p>
                    <p className="duplicate_confirm_p">{L['DUPLIKAATIT_VARMISTUS_OPPIJANUMERO']}</p>
                    <p className="duplicate_confirm_p">{L['DUPLIKAATIT_VARMISTUS_HETU_EI_OLE']}</p>
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

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
    koodisto: state.koodisto,
    omattiedot: state.omattiedot,
});

export default connect(mapStateToProps)(HenkiloViewDuplikaatit);
