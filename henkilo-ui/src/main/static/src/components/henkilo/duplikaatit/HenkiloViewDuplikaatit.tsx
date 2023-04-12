import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import type { RootState } from '../../../store';
import './HenkiloViewDuplikaatit.css';
import Button from '../../common/button/Button';
import * as R from 'ramda';
import DuplikaatitPerson from './DuplikaatitPerson';
import Loader from '../../common/icons/Loader';
import { FloatingBar } from './FloatingBar';
import { enabledDuplikaattiView } from '../../navigation/NavigationTabs';
import type { Locale } from '../../../types/locale.type';
import type { Localisations } from '../../../types/localisation.type';
import type { KoodistoState } from '../../../reducers/koodisto.reducer';
import { LocalNotification } from '../../common/Notification/LocalNotification';
import { NOTIFICATIONTYPES } from '../../common/Notification/notificationtypes';
import { linkHenkilos, forceLinkHenkilos } from '../../../actions/henkilo.actions';
import type {
    HenkiloDuplicate,
    HenkiloDuplicateLenient,
} from '../../../types/domain/oppijanumerorekisteri/HenkiloDuplicate';
import type { OmattiedotState } from '../../../reducers/omattiedot.reducer';
import { hasAnyPalveluRooli } from '../../../utilities/palvelurooli.util';
import { Hakemus } from '../../../types/domain/oppijanumerorekisteri/Hakemus.type';

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
    ownOid: string;
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
    ownOid,
}: Props) => {
    const [selectedDuplicates, setSelectedDuplicates] = useState<string[]>([]);
    const dispatch = useDispatch();
    const canForceLink = hasAnyPalveluRooli(omattiedot.organisaatiot, ['OPPIJANUMEROREKISTERI_YKSILOINNIN_PURKU']);
    const yksiloitySelected = canForceLink ? false : henkilo.henkilo['yksiloity'] || henkilo.henkilo['yksiloityVTJ'];
    const emails = (henkilo.henkilo.yhteystiedotRyhma || [])
        .flatMap((ryhma) => ryhma.yhteystieto)
        .filter((yhteysTieto) => yhteysTieto.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI')
        .map((yhteysTieto) => yhteysTieto.yhteystietoArvo);
    const master: HenkiloDuplicate = { ...henkilo.henkilo, emails, hakemukset: henkilo.hakemukset };

    const setSelection = (oid: string) => {
        const newSelected = selectedDuplicates.includes(oid)
            ? R.reject((duplicateOid) => duplicateOid === oid, selectedDuplicates)
            : R.append(oid, selectedDuplicates);
        setSelectedDuplicates(newSelected);
    };

    const _link = async (force: boolean) => {
        const successMessage = L['DUPLIKAATIT_NOTIFICATION_ONNISTUI'];
        const failMessage = L['DUPLIKAATIT_NOTIFICATION_EPAONNISTUI'];
        const oid = oidHenkilo ?? '';
        const action = force ? forceLinkHenkilos : linkHenkilos;
        await dispatch<any>(action(oid, selectedDuplicates, successMessage, failMessage));
        if (router) {
            router.push(`/${henkiloType}/${oid}`);
        }
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
                    vainLuku={vainLuku}
                    henkiloType={henkiloType}
                    setSelection={setSelection}
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
                        classNames={{ person: true }}
                        vainLuku={vainLuku}
                        henkiloType={henkiloType}
                        setSelection={setSelection}
                        yksiloitySelected={yksiloitySelected}
                    ></DuplikaatitPerson>
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
                    <Button
                        disabled={
                            selectedDuplicates.length === 0 ||
                            !enabledDuplikaattiView(
                                oidHenkilo,
                                henkilo.kayttaja,
                                henkilo.masterLoading,
                                henkilo.master.oidHenkilo
                            ) ||
                            oidHenkilo === ownOid
                        }
                        action={() => _link(false)}
                    >
                        {L['DUPLIKAATIT_YHDISTA']}
                    </Button>
                    {canForceLink ? (
                        <Button
                            disabled={
                                selectedDuplicates.length === 0 ||
                                !enabledDuplikaattiView(
                                    oidHenkilo,
                                    henkilo.kayttaja,
                                    henkilo.masterLoading,
                                    henkilo.master.oidHenkilo
                                ) ||
                                oidHenkilo === ownOid
                            }
                            action={() => _link(true)}
                        >
                            {L['DUPLIKAATIT_PURA_YKSILOINNIT_JA_YHDISTA']}
                        </Button>
                    ) : null}
                </FloatingBar>
            )}
        </div>
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    ownOid: state.omattiedot.data.oid,
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
    koodisto: state.koodisto,
    omattiedot: state.omattiedot,
});

export default connect(mapStateToProps)(HenkiloViewDuplikaatit);
