import React, { useState } from 'react';
import { connect } from 'react-redux';

import { RootState } from '../../../store';
import Button from '../../common/button/Button';
import DuplikaatitPerson from './DuplikaatitPerson';
import Loader from '../../common/icons/Loader';
import { FloatingBar } from './FloatingBar';
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
    const [selectedDuplicates, setSelectedDuplicates] = useState<HenkiloDuplicate[]>([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [postLinkHenkilos] = usePostLinkHenkilosMutation();
    const canForceLink = hasAnyPalveluRooli(omattiedot.organisaatiot, ['OPPIJANUMEROREKISTERI_YKSILOINNIN_PURKU']);
    const emails = (henkilo.henkilo.yhteystiedotRyhma || [])
        .flatMap((ryhma) => ryhma.yhteystieto)
        .filter((yhteysTieto) => yhteysTieto.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI')
        .map((yhteysTieto) => yhteysTieto.yhteystietoArvo);
    const master: HenkiloDuplicate = { ...henkilo.henkilo, emails, hakemukset: henkilo.hakemukset };
    const isDuplicateViewDisabled =
        !enabledDuplikaattiView(oidHenkilo, henkilo.kayttaja, henkilo.masterLoading, henkilo.master.oidHenkilo) ||
        oidHenkilo === omattiedot.data.oid;
    const duplicatesIncludeYksiloity = selectedDuplicates.length && selectedDuplicates.some((s) => s.yksiloity);
    const isLinkDisabled = isDuplicateViewDisabled || !selectedDuplicates.length || duplicatesIncludeYksiloity;
    const isForceLinkDisabled = isDuplicateViewDisabled || !selectedDuplicates.length || !duplicatesIncludeYksiloity;

    const setSelection = (d: HenkiloDuplicate, add: boolean) => {
        const newSelected = add
            ? [...selectedDuplicates, d]
            : selectedDuplicates.filter((s) => s.oidHenkilo !== d.oidHenkilo);
        setSelectedDuplicates(newSelected);
    };

    const _link = async (force: boolean) => {
        const masterOid = oidHenkilo ?? '';
        const duplicateOids = selectedDuplicates.map((d) => d.oidHenkilo);
        return await postLinkHenkilos({ masterOid, duplicateOids, L, force })
            .unwrap()
            .then(() => {
                setShowConfirmation(false);
                router?.push(`/${henkiloType}/${masterOid}`);
            })
            .catch(() => {
                setShowConfirmation(false);
            });
    };

    return (
        <div className="duplicates-view">
            <div id="duplicates">
                <div className="person header">
                    <span />
                    <span />
                    <span>{L['DUPLIKAATIT_HENKILOTUNNUS']}</span>
                    <span>{L['DUPLIKAATIT_YKSILOITY']}</span>
                    <span>{L['DUPLIKAATIT_KUTSUMANIMI']}</span>
                    <span>{L['DUPLIKAATIT_ETUNIMET']}</span>
                    <span>{L['DUPLIKAATIT_SUKUNIMI']}</span>
                    <span>{L['DUPLIKAATIT_SUKUPUOLI']}</span>
                    <span>{L['DUPLIKAATIT_SYNTYMAAIKA']}</span>
                    <span>{L['DUPLIKAATIT_OIDHENKILO']}</span>
                    <span>{L['DUPLIKAATIT_SAHKOPOSTIOSOITE']}</span>
                    <span>{L['DUPLIKAATIT_PASSINUMERO']}</span>
                    <span>{L['DUPLIKAATIT_KANSALAISUUS']}</span>
                    <span>{L['DUPLIKAATIT_AIDINKIELI']}</span>
                    <span />
                    <span className="hakemus">{L['DUPLIKAATIT_KANSALAISUUS']}</span>
                    <span className="hakemus">{L['DUPLIKAATIT_AIDINKIELI']}</span>
                    <span className="hakemus">{L['DUPLIKAATIT_MATKAPUHELINNUMERO']}</span>
                    <span className="hakemus">{L['DUPLIKAATIT_SAHKOPOSTIOSOITE']}</span>
                    <span className="hakemus">{L['DUPLIKAATIT_OSOITE']}</span>
                    <span className="hakemus">{L['DUPLIKAATIT_POSTINUMERO']}</span>
                    <span className="hakemus">{L['DUPLIKAATIT_PASSINUMERO']}</span>
                    <span className="hakemus">{L['DUPLIKAATIT_KANSALLINENID']}</span>
                    <span className="hakemus">{L['DUPLIKAATIT_HAKEMUKSENTILA']}</span>
                    <span className="hakemus">{L['DUPLIKAATIT_HAKEMUKSENOID']}</span>
                    <span className="hakemus">{L['DUPLIKAATIT_MUUTHAKEMUKSET']}</span>
                </div>
                <DuplikaatitPerson
                    henkilo={master}
                    koodisto={koodisto}
                    L={L}
                    header={'DUPLIKAATIT_HENKILON_TIEDOT'}
                    locale={locale}
                    classNames={{ person: true, master: true }}
                    isMaster={true}
                    isMasterPassivoitu={master.passivoitu}
                    vainLuku={vainLuku}
                    henkiloType={henkiloType}
                    setSelection={setSelection}
                    canForceLink={canForceLink}
                    duplicatesIncludeYksiloity={duplicatesIncludeYksiloity}
                />
                {henkilo.duplicates.map((duplicate) => (
                    <DuplikaatitPerson
                        henkilo={duplicate}
                        koodisto={koodisto}
                        L={L}
                        header={'DUPLIKAATIT_DUPLIKAATTI'}
                        locale={locale}
                        key={duplicate.oidHenkilo}
                        isMaster={false}
                        isMasterPassivoitu={master.passivoitu}
                        classNames={{ person: true }}
                        vainLuku={vainLuku}
                        henkiloType={henkiloType}
                        setSelection={setSelection}
                        canForceLink={canForceLink}
                        duplicatesIncludeYksiloity={duplicatesIncludeYksiloity}
                    />
                ))}
                {henkilo.duplicatesLoading ? <Loader /> : null}
                <LocalNotification
                    title={L['DUPLIKAATIT_NOTIFICATION_EI_LOYTYNYT']}
                    type={NOTIFICATIONTYPES.INFO}
                    toggle={!henkilo.duplicates}
                ></LocalNotification>
            </div>
            {!vainLuku && oidHenkilo && (
                <FloatingBar>
                    <Button disabled={isLinkDisabled} action={() => _link(false)} dataTestId="yhdista-button">
                        {L['DUPLIKAATIT_YHDISTA']}
                    </Button>
                    {canForceLink && (
                        <Button
                            disabled={isForceLinkDisabled}
                            action={() => setShowConfirmation(true)}
                            dataTestId="force-link-button"
                        >
                            {L['DUPLIKAATIT_PURA_YKSILOINNIT_JA_YHDISTA']}
                        </Button>
                    )}
                </FloatingBar>
            )}
            {showConfirmation && (
                <OphModal
                    onClose={() => setShowConfirmation(false)}
                    onOverlayClick={() => setShowConfirmation(false)}
                    title={L['DUPLIKAATIT_VARMISTUS_OTSIKKO']}
                >
                    <p className="duplicate_confirm_p">{L['DUPLIKAATIT_VARMISTUS_OLETKO_VARMA']}</p>
                    <p className="duplicate_confirm_p">{L['DUPLIKAATIT_VARMISTUS_OPPIJANUMERO']}</p>
                    <p className="duplicate_confirm_p">{L['DUPLIKAATIT_VARMISTUS_HETU_EI_OLE']}</p>
                    <div className="duplicate_confirm_buttons">
                        <Button action={() => _link(true)} dataTestId="confirm-force-link">
                            {L['DUPLIKAATIT_VARMISTUS_YHDISTA']}
                        </Button>
                        <Button action={() => setShowConfirmation(false)}>{L['DUPLIKAATIT_VARMISTUS_PERUUTA']}</Button>
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
