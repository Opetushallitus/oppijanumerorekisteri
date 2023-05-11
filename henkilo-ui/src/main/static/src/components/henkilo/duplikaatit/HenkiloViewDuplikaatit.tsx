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
import { LinkHenkilosRequest, usePostLinkHenkilosMutation } from '../../../api/oppijanumerorekisteri';

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
    const [masterToDuplicateOid, setMasterToDuplicateOid] = useState<string>('');
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
    const isLinkDisabled =
        isDuplicateViewDisabled || !selectedDuplicates.length || duplicatesIncludeYksiloity || !!masterToDuplicateOid;
    const isForceLinkDisabled =
        isDuplicateViewDisabled || !selectedDuplicates.length || !duplicatesIncludeYksiloity || !!masterToDuplicateOid;

    const setSelection = (d: HenkiloDuplicate, add: boolean) => {
        const newSelected = add
            ? [...selectedDuplicates, d]
            : selectedDuplicates.filter((s) => s.oidHenkilo !== d.oidHenkilo);
        setSelectedDuplicates(newSelected);
    };

    const doLinkHenkilos = async (linkHenkilosRequest: LinkHenkilosRequest) => {
        return await postLinkHenkilos(linkHenkilosRequest)
            .unwrap()
            .then(() => {
                setShowConfirmation(false);
                router?.push(`/${henkiloType}/${oidHenkilo}`);
            })
            .catch(() => {
                setShowConfirmation(false);
            });
    };

    const linkToMaster = async (force: boolean) => {
        const masterOid = oidHenkilo ?? '';
        const duplicateOids = selectedDuplicates.map((d) => d.oidHenkilo);
        return await doLinkHenkilos({ masterOid, duplicateOids, L, force });
    };

    const linkMasterToDuplicate = async (duplicateOid: string, force: boolean) => {
        return await doLinkHenkilos({ masterOid: duplicateOid, duplicateOids: [oidHenkilo], L, force });
    };

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
                    setSelection={setSelection}
                    canForceLink={canForceLink}
                    duplicatesIncludeYksiloity={duplicatesIncludeYksiloity}
                    setMasterToDuplicateOid={setMasterToDuplicateOid}
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
                        setSelection={setSelection}
                        canForceLink={canForceLink}
                        duplicatesIncludeYksiloity={duplicatesIncludeYksiloity}
                        setMasterToDuplicateOid={setMasterToDuplicateOid}
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
                    <Button disabled={isLinkDisabled} action={() => linkToMaster(false)} dataTestId="yhdista-button">
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
                <ConfirmationModal L={L} hide={() => setShowConfirmation(false)} link={() => linkToMaster(true)} />
            )}
            {masterToDuplicateOid && (
                <ConfirmationModal
                    L={L}
                    hide={() => setMasterToDuplicateOid('')}
                    link={() => linkMasterToDuplicate(masterToDuplicateOid, true)}
                />
            )}
        </div>
    );
};

type ConfirmationModalProps = {
    hide: () => void;
    link: () => void;
    L: Localisations;
};

const ConfirmationModal = ({ hide, link, L }: ConfirmationModalProps) => {
    return (
        <OphModal onClose={() => hide()} onOverlayClick={() => hide()} title={L['DUPLIKAATIT_VARMISTUS_OTSIKKO']}>
            <p className="duplicate_confirm_p">{L['DUPLIKAATIT_VARMISTUS_OLETKO_VARMA']}</p>
            <p className="duplicate_confirm_p">{L['DUPLIKAATIT_VARMISTUS_OPPIJANUMERO']}</p>
            <p className="duplicate_confirm_p">{L['DUPLIKAATIT_VARMISTUS_HETU_EI_OLE']}</p>
            <div className="duplicate_confirm_buttons">
                <Button action={() => link()} dataTestId="confirm-force-link">
                    {L['DUPLIKAATIT_VARMISTUS_YHDISTA']}
                </Button>
                <Button action={() => hide()}>{L['DUPLIKAATIT_VARMISTUS_PERUUTA']}</Button>
            </div>
        </OphModal>
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
    koodisto: state.koodisto,
    omattiedot: state.omattiedot,
});

export default connect(mapStateToProps)(HenkiloViewDuplikaatit);
