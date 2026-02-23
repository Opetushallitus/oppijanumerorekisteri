import React, { useId, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import { Link } from 'react-router';
import Select, { MultiValue, SingleValue } from 'react-select';
import { format, parseISO } from 'date-fns';

import { useAppDispatch } from '../../store';
import { add } from '../../slices/toastSlice';
import {
    useGetHenkiloMasterQuery,
    useGetHenkiloQuery,
    useGetHenkiloSlavesQuery,
    useUnlinkHenkiloMutation,
    useUpdateHenkiloMutation,
} from '../../api/oppijanumerorekisteri';
import {
    koodiLabelByKoodiarvo,
    useGetKansalaisuudetQuery,
    useGetKieletQuery,
    useGetSukupuoletQuery,
} from '../../api/koodisto';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';
import {
    useAsiointikielet,
    useKansalaisuusOptions,
    useKieliOptions,
    useLocalisations,
    useSukupuoliOptions,
} from '../../selectors';
import { hasAnyPalveluRooli } from '../../utilities/palvelurooli.util';
import { isVahvastiYksiloity } from '../common/StaticUtils';
import YksiloiHetutonButton from '../common/henkilo/buttons/YksiloiHetutonButton';
import PassivoiButton from '../common/henkilo/buttons/PassivoiButton';
import AktivoiButton from '../common/henkilo/buttons/AktivoiButton';
import VtjOverrideButton from '../common/henkilo/buttons/VtjOverrideButton';
import PuraHetuttomanYksilointiButton from '../common/henkilo/buttons/PuraHetuttomanYksilointi';
import OphModal from '../common/modal/OphModal';
import PassinumeroPopupContent from '../common/henkilo/buttons/PassinumeroPopupContent';
import Loader from '../common/icons/Loader';
import { OphDsInput } from '../design-system/OphDsInput';
import { isValidHetu } from '../../validation/YksilointiValidator';
import { isValidKutsumanimi } from '../../validation/KutsumanimiValidator';
import { Henkilo } from '../../types/domain/oppijanumerorekisteri/henkilo.types';
import { SelectOption, selectStyles } from '../../utilities/select';

import styles from './OppijaPerustiedot.module.css';

const OppijaPerustiedotForm = ({ henkilo, closeForm }: { henkilo: Henkilo; closeForm: () => void }) => {
    const { L, locale } = useLocalisations();
    const dispatch = useAppDispatch();

    const kieliOptions = useKieliOptions(locale);
    const asiointikieliOptions = useAsiointikielet(locale);
    const kansalaisuusOptions = useKansalaisuusOptions(locale);
    const sukupuoliOptions = useSukupuoliOptions(locale);

    const [etunimet, setEtunimet] = useState(henkilo.etunimet);
    const [sukunimi, setSukunimi] = useState(henkilo.sukunimi);
    const [syntymaaika, setSyntymaaika] = useState(henkilo.syntymaaika ? parseISO(henkilo.syntymaaika) : null);
    const [hetu, setHetu] = useState(henkilo.hetu);
    const [kansalaisuus, setKansalaisuus] = useState<MultiValue<SelectOption>>(
        kansalaisuusOptions.filter((k) => henkilo?.kansalaisuus.some((o) => o.kansalaisuusKoodi === k.value))
    );
    const [aidinkieli, setAidinkieli] = useState<SingleValue<SelectOption> | undefined>(
        kieliOptions.find((k) => k.value === henkilo?.aidinkieli?.kieliKoodi)
    );
    const [sukupuoli, setSukupuoli] = useState<SingleValue<SelectOption> | undefined>(
        sukupuoliOptions.find((k) => k.value === henkilo?.sukupuoli)
    );
    const [kutsumanimi, setKutsumanimi] = useState(henkilo.kutsumanimi);
    const [asiointikieli, setAsiointikieli] = useState<SingleValue<SelectOption> | undefined>(
        asiointikieliOptions.find((k) => k.value === henkilo?.asiointiKieli?.kieliKoodi)
    );

    const isFormValid = useMemo(() => {
        return !!etunimet && !!sukunimi && isValidKutsumanimi(etunimet, kutsumanimi) && (!hetu || isValidHetu(hetu));
    }, [etunimet, sukunimi, kutsumanimi, hetu]);

    const [putHenkilo] = useUpdateHenkiloMutation();
    const updateHenkilo = async () => {
        const henkiloUpdate: Partial<Henkilo> = {
            ...structuredClone(henkilo),
            etunimet,
            sukunimi,
            kutsumanimi,
            hetu,
            syntymaaika: syntymaaika ? format(syntymaaika, 'yyyy-MM-dd') : undefined,
            kansalaisuus: kansalaisuus.map((k) => ({ kansalaisuusKoodi: k.value })),
            aidinkieli: kieliOptions
                .filter((k) => k.value === aidinkieli?.value)
                .map((k) => ({ kieliKoodi: k.value, kieliTyyppi: k.label }))
                .pop(),
            asiointiKieli: asiointikieliOptions
                .filter((k) => k.value === asiointikieli?.value)
                .map((k) => ({ kieliKoodi: k.value, kieliTyyppi: k.label }))
                .pop(),
            sukupuoli: sukupuoli?.value as '1' | '2',
        };
        await putHenkilo(henkiloUpdate)
            .unwrap()
            .then(() => closeForm())
            .catch((error) => {
                const header =
                    error.status === 400 && error.data.includes('invalid.hetu')
                        ? L['NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE_HETU']
                        : error.data.includes('socialsecuritynr.already.exists')
                          ? L['NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE_HETU_KAYTOSSA']
                          : L['NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE'];
                dispatch(
                    add({
                        id: `henkilo-update-failed-${Math.random()}`,
                        type: 'error',
                        header,
                    })
                );
            });
    };

    return (
        <>
            <div className={styles.perustiedotRows}>
                <div>
                    {!isVahvastiYksiloity(henkilo) && (
                        <>
                            <OphDsInput
                                id="etunimet"
                                error={etunimet ? undefined : ''}
                                defaultValue={etunimet}
                                label={L['HENKILO_ETUNIMET']!}
                                onChange={setEtunimet}
                            />
                            <OphDsInput
                                id="sukunimi"
                                error={sukunimi ? undefined : ''}
                                defaultValue={sukunimi}
                                label={L['HENKILO_SUKUNIMI']!}
                                onChange={setSukunimi}
                            />
                            <OphDsInput
                                id="hetu"
                                error={hetu && !isValidHetu(hetu) ? '' : undefined}
                                defaultValue={hetu}
                                label={L['HENKILO_HETU']!}
                                onChange={setHetu}
                            />
                        </>
                    )}
                    <OphDsInput
                        id="kutsumanimi"
                        error={
                            isValidKutsumanimi(etunimet, kutsumanimi) ? undefined : L['HENKILO_KUTSUMANIMI_VALIDOINTI']
                        }
                        defaultValue={kutsumanimi}
                        label={L['HENKILO_KUTSUMANIMI']!}
                        onChange={setKutsumanimi}
                    />
                    <div style={{ width: '300px' }}>
                        <label className="oph-ds-label" htmlFor="kieli-select">
                            {L['HENKILO_ASIOINTIKIELI']}
                        </label>
                        <Select
                            {...selectStyles}
                            inputId="asiointikieli-select"
                            options={asiointikieliOptions}
                            value={asiointikieli}
                            onChange={setAsiointikieli}
                            placeholder={L['HENKILO_ASIOINTIKIELI']}
                        />
                    </div>
                </div>
                {!isVahvastiYksiloity(henkilo) && (
                    <div>
                        <div style={{ width: '300px' }}>
                            <label className="oph-ds-label" htmlFor="syntymaaika">
                                {L['HENKILO_SYNTYMAAIKA']}
                            </label>
                            <DatePicker
                                id="syntymaaika"
                                className="oph-ds-input"
                                onChange={setSyntymaaika}
                                selected={syntymaaika}
                                showYearDropdown
                                showWeekNumbers
                                dateFormat="d.M.yyyy"
                            />
                        </div>
                        <div style={{ width: '300px' }}>
                            <label className="oph-ds-label" htmlFor="kansalaisuus-select">
                                {L['HENKILO_KANSALAISUUS']}
                            </label>
                            <Select
                                {...selectStyles}
                                inputId="kansalaisuus-select"
                                isMulti={true}
                                options={kansalaisuusOptions}
                                value={kansalaisuus}
                                onChange={setKansalaisuus}
                                placeholder={L['HENKILO_KANSALAISUUS']}
                            />
                        </div>
                        <div style={{ width: '300px' }}>
                            <label className="oph-ds-label" htmlFor="aidinkieli-select">
                                {L['HENKILO_AIDINKIELI']}
                            </label>
                            <Select
                                {...selectStyles}
                                inputId="aidinkieli-select"
                                options={kieliOptions}
                                value={aidinkieli}
                                onChange={setAidinkieli}
                                placeholder={L['HENKILO_AIDINKIELI']}
                            />
                        </div>
                        <div style={{ width: '300px' }}>
                            <label className="oph-ds-label" htmlFor="sukupuoli-select">
                                {L['HENKILO_SUKUPUOLI']}
                            </label>
                            <Select
                                {...selectStyles}
                                inputId="sukupuoli-select"
                                options={sukupuoliOptions}
                                value={sukupuoli}
                                onChange={setSukupuoli}
                                placeholder={L['HENKILO_SUKUPUOLI']}
                            />
                        </div>
                    </div>
                )}
            </div>
            <div className={styles.buttonRow}>
                <button className="oph-ds-button" disabled={!isFormValid} onClick={updateHenkilo}>
                    {L['TALLENNA']}
                </button>
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
                    <div data-testid="syntymaaika">
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
                    <div>{L['HENKILO_ASIOINTIKIELI']}</div>
                    <div data-testid="asiointikieli">
                        {koodiLabelByKoodiarvo(kieliKoodisto, henkilo?.asiointiKieli?.kieliKoodi.toUpperCase(), locale)}
                    </div>
                </div>
                <div className={styles.perustiedotGrid}>
                    <div>{L['HENKILO_KANSALAISUUS']}</div>
                    <div data-testid="kansalaisuus">
                        {henkilo?.kansalaisuus
                            .map((k) => koodiLabelByKoodiarvo(kansalaisuusKoodisto, k.kansalaisuusKoodi, locale))
                            .join(', ')}
                    </div>
                    <div>{L['HENKILO_AIDINKIELI']}</div>
                    <div data-testid="aidinkieli">
                        {koodiLabelByKoodiarvo(kieliKoodisto, henkilo?.aidinkieli?.kieliKoodi.toUpperCase(), locale)}
                    </div>
                    <div>{L['HENKILO_SUKUPUOLI']}</div>
                    <div data-testid="sukupuoli">
                        {koodiLabelByKoodiarvo(sukupuoliKoodisto, henkilo?.sukupuoli, locale)}
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
                {hasUpdatePermission && !henkilo?.duplicate && !henkilo?.passivoitu && (
                    <button className="oph-ds-button" onClick={() => openForm()}>
                        {L['MUOKKAA']}
                    </button>
                )}
                {hasYksilointiPermission &&
                    !isVahvastiYksiloity(henkilo) &&
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
                {omattiedot?.isAdmin && henkilo?.yksiloity && !isVahvastiYksiloity(henkilo) && !henkilo?.hetu && (
                    <PuraHetuttomanYksilointiButton className="oph-ds-button" henkiloOid={oid} />
                )}
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
                {omattiedot?.isAdmin && !henkilo?.duplicate && !henkilo?.passivoitu && (
                    <VtjOverrideButton className="oph-ds-button" henkiloOid={oid} />
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
        return info.length ? ' (' + info.join(', ') + ')' : '';
    }, [henkilo]);

    return (
        <section aria-labelledby={sectionId} className="henkiloViewUserContentWrapper">
            <h2 id={sectionId}>{L['OPPIJAN_PERUSTIEDOT'] + yksilointiTranslation}</h2>
            <div className={styles.perustiedotContent}>
                {isLoading ? (
                    <Loader />
                ) : isForm && henkilo ? (
                    <OppijaPerustiedotForm henkilo={henkilo} closeForm={() => setForm(false)} />
                ) : (
                    <OppijaPerustiedotView oid={oid} openForm={() => setForm(true)} />
                )}
            </div>
        </section>
    );
};
