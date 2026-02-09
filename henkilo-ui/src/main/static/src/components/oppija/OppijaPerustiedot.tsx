import React, { useId, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { format, parseISO } from 'date-fns';

import {
    useGetHenkiloMasterQuery,
    useGetHenkiloQuery,
    useGetHenkiloSlavesQuery,
    useUnlinkHenkiloMutation,
} from '../../api/oppijanumerorekisteri';
import {
    koodiLabelByKoodiarvo,
    useGetKansalaisuudetQuery,
    useGetKieletQuery,
    useGetSukupuoletQuery,
} from '../../api/koodisto';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { useLocalisations } from '../../selectors';
import { hasAnyPalveluRooli } from '../../utilities/palvelurooli.util';
import YksiloiHetutonButton from '../common/henkilo/buttons/YksiloiHetutonButton';
import StaticUtils from '../common/StaticUtils';
import PassivoiButton from '../common/henkilo/buttons/PassivoiButton';
import AktivoiButton from '../common/henkilo/buttons/AktivoiButton';
import PuraHetuttomanYksilointiButton from '../common/henkilo/buttons/PuraHetuttomanYksilointi';
import OphModal from '../common/modal/OphModal';
import PassinumeroPopupContent from '../common/henkilo/buttons/PassinumeroPopupContent';
import Loader from '../common/icons/Loader';

import styles from './OppijaPerustiedot.module.css';

const OppijaPerustiedotForm = ({ oid, closeForm }: { oid: string; closeForm: () => void }) => {
    const { L } = useLocalisations();
    return (
        <>
            <div className={styles.perustiedotRows}>{oid}</div>
            <div className={styles.buttonRow}>
                <button className="oph-ds-button">{L['TALLENNA']}</button>
                <button className="oph-ds-button oph-ds-button-bordered" onClick={() => closeForm()} disabled={false}>
                    {L['PERUUTA']}
                </button>
            </div>
        </>
    );
};

const OppijaPerustiedotView = ({ oid, openForm }: { oid: string; openForm: () => void }) => {
    const { L, locale } = useLocalisations();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: henkilo } = useGetHenkiloQuery(oid);
    const { data: master } = useGetHenkiloMasterQuery(oid);
    const { data: duplicates } = useGetHenkiloSlavesQuery(oid);
    const { data: sukupuoliKoodisto } = useGetSukupuoletQuery();
    const { data: kieliKoodisto } = useGetKieletQuery();
    const { data: kansalaisuusKoodisto } = useGetKansalaisuudetQuery();
    const [unlinkHenkilo] = useUnlinkHenkiloMutation();
    const [passport, setPassport] = useState(false);

    const hasLinkitetytPermission = useMemo(() => {
        return hasAnyPalveluRooli(omattiedot?.organisaatiot, ['OPPIJANUMEROREKISTERI_REKISTERINPITAJA']);
    }, [omattiedot]);
    const hasUpdatePermission = useMemo(() => {
        return hasAnyPalveluRooli(omattiedot?.organisaatiot, [
            'OPPIJANUMEROREKISTERI_HENKILON_RU',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
            'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI',
        ]);
    }, [omattiedot]);
    const hasYksilointiPermission = useMemo(() => {
        return hasAnyPalveluRooli(omattiedot?.organisaatiot, [
            'OPPIJANUMEROREKISTERI_MANUAALINEN_YKSILOINTI',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
            'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI',
        ]);
    }, [omattiedot]);

    return (
        <>
            {passport && (
                <OphModal title={L['PASSINUMEROT']} onClose={() => setPassport(false)}>
                    <PassinumeroPopupContent oid={oid} />
                </OphModal>
            )}
            <div className={styles.perustiedotRows}>
                <div className={styles.perustiedotGrid}>
                    <div>{L['HENKILO_SUKUNIMI']}</div>
                    <div data-testid="sukunimi">{henkilo?.sukunimi}</div>
                    <div>{L['HENKILO_ETUNIMET']}</div>
                    <div data-testid="etunimet">{henkilo?.etunimet}</div>
                    <div>{L['HENKILO_KUTSUMANIMI']}</div>
                    <div data-testid="kutsumanimi">{henkilo?.kutsumanimi}</div>
                    <div>{L['HENKILO_SYNTYMAAIKA']}</div>
                    <div data-testid="kutsumanimi">
                        {henkilo?.syntymaaika ? format(parseISO(henkilo.syntymaaika), 'd.M.yyyy') : ''}
                    </div>
                    <div>{L['HENKILO_HETU']}</div>
                    <div data-testid="hetu">{henkilo?.hetu}</div>
                    {henkilo?.eidasTunnisteet && henkilo.eidasTunnisteet.length > 0 && (
                        <>
                            <div>{L['HENKILO_EIDASTUNNISTEET']}</div>
                            <div data-testid="eidas">{henkilo?.eidasTunnisteet.map((e) => e.tunniste).join(', ')}</div>
                        </>
                    )}
                    <div>{L['HENKILO_SUKUPUOLI']}</div>
                    <div data-testid="sukupuoli">
                        {koodiLabelByKoodiarvo(sukupuoliKoodisto, henkilo?.sukupuoli, locale)}
                    </div>
                </div>
                <div className={styles.perustiedotGrid}>
                    <div>{L['HENKILO_KANSALAISUUS']}</div>
                    <div data-testid="kansalaisuus">
                        {henkilo?.kansalaisuus
                            .map((k) => koodiLabelByKoodiarvo(kansalaisuusKoodisto, k.kansalaisuusKoodi, locale))
                            .join(',')}
                    </div>
                    <div>{L['HENKILO_ASIOINTIKIELI']}</div>
                    <div data-testid="asiointikieli">
                        {koodiLabelByKoodiarvo(kieliKoodisto, henkilo?.asiointiKieli?.kieliKoodi.toUpperCase(), locale)}
                    </div>
                    <div>{L['HENKILO_AIDINKIELI']}</div>
                    <div data-testid="aidinkieli">
                        {koodiLabelByKoodiarvo(kieliKoodisto, henkilo?.aidinkieli?.kieliKoodi.toUpperCase(), locale)}
                    </div>
                    <div>{L['HENKILO_OPPIJANUMERO']}</div>
                    <div data-testid="oppijanumero">{master?.oidHenkilo}</div>
                    <div>{L['HENKILO_OID']}</div>
                    <div data-testid="oid">{oid}</div>
                    {duplicates?.length ? (
                        <>
                            <div>{L['HENKILO_LINKITETYT']}</div>
                            <div data-testid="duplicates">
                                {duplicates.map((d) => {
                                    return (
                                        <div key={`duplicate-${d.oidHenkilo}`}>
                                            <Link
                                                className="oph-ds-link"
                                                to={`/oppija2/${d.oidHenkilo}`}
                                            >{`${d.sukunimi}, ${d.kutsumanimi}`}</Link>
                                            {hasLinkitetytPermission && (
                                                <button
                                                    className="oph-ds-button oph-ds-button-narrow oph-ds-button-transparent"
                                                    onClick={() =>
                                                        unlinkHenkilo({ masterOid: oid, slaveOid: d.oidHenkilo })
                                                    }
                                                >
                                                    {L['HENKILO_POISTA_LINKITYS']}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : undefined}
                    {master && master.oidHenkilo !== oid ? (
                        <>
                            <div>{L['HENKILO_LINKITETYT_MASTER']}</div>
                            <div data-testid="master">
                                <Link
                                    className="oph-ds-link"
                                    to={`/oppija2/${master.oidHenkilo}`}
                                >{`${master.sukunimi}, ${master.kutsumanimi}`}</Link>
                                {hasLinkitetytPermission && (
                                    <button
                                        className="oph-ds-button oph-ds-button-narrow oph-ds-button-transparent"
                                        onClick={() => unlinkHenkilo({ masterOid: master.oidHenkilo, slaveOid: oid })}
                                    >
                                        {L['HENKILO_POISTA_LINKITYS']}
                                    </button>
                                )}
                            </div>
                        </>
                    ) : undefined}
                </div>
            </div>
            <div className={styles.buttonRow}>
                {hasUpdatePermission && (
                    <button className="oph-ds-button" onClick={() => openForm()}>
                        {L['MUOKKAA']}
                    </button>
                )}
                {hasYksilointiPermission &&
                    !StaticUtils.isVahvastiYksiloity(henkilo) &&
                    !henkilo?.yksiloity &&
                    !henkilo?.hetu &&
                    !henkilo?.duplicate &&
                    !henkilo?.passivoitu && (
                        <YksiloiHetutonButton
                            className="oph-ds-button"
                            henkiloOid={oid}
                            disabled={henkilo?.duplicate || henkilo?.passivoitu}
                        />
                    )}
                {omattiedot?.isAdmin &&
                    henkilo?.yksiloity &&
                    !StaticUtils.isVahvastiYksiloity(henkilo) &&
                    !henkilo?.hetu && <PuraHetuttomanYksilointiButton className="oph-ds-button" henkiloOid={oid} />}
                {omattiedot?.isAdmin && !henkilo?.passivoitu && (
                    <PassivoiButton className="oph-ds-button" henkiloOid={oid} passivoitu={false} />
                )}
                {omattiedot?.isAdmin && henkilo?.passivoitu && (
                    <AktivoiButton className="oph-ds-button" oidHenkilo={oid} />
                )}
                {omattiedot?.isAdmin && (
                    <button className="oph-ds-button" onClick={() => setPassport(true)}>
                        {L['HALLITSE_PASSINUMEROITA']}
                    </button>
                )}
            </div>
        </>
    );
};

export const OppijaPerustiedot = ({ oid }: { oid: string }) => {
    const { L } = useLocalisations();
    const { data: henkilo, isLoading } = useGetHenkiloQuery(oid);
    const [isForm, setForm] = useState(false);

    const sectionId = useId();

    const yksilointiTranslation = useMemo(() => {
        const info = [];
        if (henkilo?.yksiloity) {
            info.push(L['HENKILO_ADDITIONALINFO_YKSILOITY']);
        }
        if (henkilo?.yksiloityEidas) {
            info.push(L['HENKILO_ADDITIONALINFO_YKSILOITYEIDAS']);
        }
        if (henkilo?.yksiloityVTJ) {
            info.push(L['HENKILO_ADDITIONALINFO_YKSILOITYVTJ']);
        }
        if (!henkilo?.yksiloity && !henkilo?.yksiloityVTJ && !henkilo?.yksiloityEidas) {
            info.push(L['HENKILO_ADDITIOINALINFO_EIYKSILOITY']);
        }
        if (henkilo?.duplicate) {
            info.push(L['HENKILO_ADDITIONALINFO_DUPLIKAATTI']);
        }
        if (henkilo?.passivoitu) {
            info.push(L['PASSIVOI_PASSIVOITU']);
        }
        return info.length ? '(' + info.join(', ') + ')' : '';
    }, [henkilo]);

    return (
        <section aria-labelledby={sectionId} className="henkiloViewUserContentWrapper">
            <h2 id={sectionId}>{'Oppijan perustiedot ' + yksilointiTranslation}</h2>
            <div className={styles.perustiedotContent}>
                {isLoading ? (
                    <Loader />
                ) : isForm ? (
                    <OppijaPerustiedotForm oid={oid} closeForm={() => setForm(false)} />
                ) : (
                    <OppijaPerustiedotView oid={oid} openForm={() => setForm(true)} />
                )}
            </div>
        </section>
    );
};
