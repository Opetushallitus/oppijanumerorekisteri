import React, { useId, useMemo, useState } from 'react';
import Select, { SingleValue } from 'react-select';
import { format, parseISO } from 'date-fns';

import { useAppDispatch } from '../../store';
import { add } from '../../slices/toastSlice';
import {
    useGetHenkiloMasterQuery,
    useGetHenkiloQuery,
    useUpdateHenkiloMutation,
} from '../../api/oppijanumerorekisteri';
import {
    koodiLabelByKoodiarvo,
    useGetKansalaisuudetQuery,
    useGetKieletQuery,
    useGetSukupuoletQuery,
} from '../../api/koodisto';
import { useAsiointikielet, useLocalisations } from '../../selectors';
import OphModal from '../common/modal/OphModal';
import { OphDsInput } from '../design-system/OphDsInput';
import { isValidKutsumanimi } from '../../validation/KutsumanimiValidator';
import { Henkilo } from '../../types/domain/oppijanumerorekisteri/henkilo.types';
import { SelectOption, selectStyles } from '../../utilities/select';
import { OphDsSpinner } from '../design-system/OphDsSpinner';
import PasswordPopupContent from '../common/button/PasswordPopupContent';
import { OmattiedotAnomusilmoitus } from './OmattiedotAnomusilmoitus';

import styles from './OmattiedotPerustiedot.module.css';

const OmattiedotPerustiedotForm = ({ henkilo, closeForm }: { henkilo: Henkilo; closeForm: () => void }) => {
    const { L, locale } = useLocalisations();
    const dispatch = useAppDispatch();
    const asiointikieliOptions = useAsiointikielet(locale);
    const [putHenkilo] = useUpdateHenkiloMutation();
    const [kutsumanimi, setKutsumanimi] = useState(henkilo.kutsumanimi);
    const [asiointikieli, setAsiointikieli] = useState<SingleValue<SelectOption> | undefined>(
        asiointikieliOptions.find((k) => k.value === henkilo?.asiointiKieli?.kieliKoodi)
    );
    const isFormValid = useMemo(() => {
        return isValidKutsumanimi(henkilo.etunimet, kutsumanimi);
    }, [kutsumanimi]);

    const updateHenkilo = async () => {
        const henkiloUpdate: Partial<Henkilo> = {
            ...structuredClone(henkilo),
            kutsumanimi,
            asiointiKieli: asiointikieliOptions
                .filter((k) => k.value === asiointikieli?.value)
                .map((k) => ({ kieliKoodi: k.value, kieliTyyppi: k.label }))
                .pop(),
        };
        await putHenkilo(henkiloUpdate)
            .unwrap()
            .then(() => closeForm())
            .catch(() => {
                dispatch(
                    add({
                        id: `henkilo-update-failed-${Math.random()}`,
                        type: 'error',
                        header: L('NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE'),
                    })
                );
            });
    };

    return (
        <>
            <div className={styles.perustiedotRows}>
                <div>
                    <OphDsInput
                        id="kutsumanimi"
                        error={
                            isValidKutsumanimi(henkilo.etunimet, kutsumanimi)
                                ? undefined
                                : L('HENKILO_KUTSUMANIMI_VALIDOINTI')
                        }
                        defaultValue={kutsumanimi}
                        label={L('HENKILO_KUTSUMANIMI')}
                        onChange={setKutsumanimi}
                    />
                    <div style={{ width: '300px' }}>
                        <label className="oph-ds-label" htmlFor="kieli-select">
                            {L('HENKILO_ASIOINTIKIELI')}
                        </label>
                        <Select
                            {...selectStyles}
                            inputId="asiointikieli-select"
                            options={asiointikieliOptions}
                            value={asiointikieli}
                            onChange={setAsiointikieli}
                            placeholder={L('HENKILO_ASIOINTIKIELI')}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.buttonRow}>
                <button className="oph-ds-button" disabled={!isFormValid} onClick={updateHenkilo}>
                    {L('TALLENNA')}
                </button>
                <button className="oph-ds-button oph-ds-button-bordered" onClick={() => closeForm()} disabled={false}>
                    {L('PERUUTA')}
                </button>
            </div>
        </>
    );
};

const OmattiedotPerustiedotView = ({ oid, openForm }: { oid: string; openForm: () => void }) => {
    const { L, locale } = useLocalisations();
    const { data: henkilo } = useGetHenkiloQuery(oid);
    const { data: master } = useGetHenkiloMasterQuery(oid);
    const { data: sukupuoliKoodisto } = useGetSukupuoletQuery();
    const { data: kieliKoodisto } = useGetKieletQuery();
    const { data: kansalaisuusKoodisto } = useGetKansalaisuudetQuery();
    const [password, setPassword] = useState(false);
    const [anomusilmoitus, setAnomusilmoitus] = useState(false);

    return (
        <>
            {password && (
                <OphModal title={L('SALASANA_ASETA')} onClose={() => setPassword(false)}>
                    <PasswordPopupContent oidHenkilo={oid} />
                </OphModal>
            )}
            {anomusilmoitus && (
                <OphModal title={L('HENKILO_ANOMUSILMOITUKSET')} onClose={() => setAnomusilmoitus(false)}>
                    <OmattiedotAnomusilmoitus onClose={() => setAnomusilmoitus(false)} />
                </OphModal>
            )}
            <div className={styles.perustiedotRows}>
                <div className={styles.perustiedotGrid}>
                    <div>{L('HENKILO_SUKUNIMI')}</div>
                    <div data-testid="sukunimi">{henkilo?.sukunimi}</div>
                    <div>{L('HENKILO_ETUNIMET')}</div>
                    <div data-testid="etunimet">{henkilo?.etunimet}</div>
                    <div>{L('HENKILO_KUTSUMANIMI')}</div>
                    <div data-testid="kutsumanimi">{henkilo?.kutsumanimi}</div>
                    <div>{L('HENKILO_SYNTYMAAIKA')}</div>
                    <div data-testid="syntymaaika">
                        {henkilo?.syntymaaika ? format(parseISO(henkilo.syntymaaika), 'd.M.yyyy') : ''}
                    </div>
                    <div>{L('HENKILO_HETU')}</div>
                    <div data-testid="hetu">{henkilo?.hetu}</div>
                    {henkilo?.eidasTunnisteet && henkilo.eidasTunnisteet.length > 0 && (
                        <>
                            <div>{L('HENKILO_EIDASTUNNISTEET')}</div>
                            <div data-testid="eidas">{henkilo?.eidasTunnisteet.map((e) => e.tunniste).join(', ')}</div>
                        </>
                    )}
                    <div>{L('HENKILO_ASIOINTIKIELI')}</div>
                    <div data-testid="asiointikieli">
                        {koodiLabelByKoodiarvo(kieliKoodisto, henkilo?.asiointiKieli?.kieliKoodi.toUpperCase(), locale)}
                    </div>
                </div>
                <div className={styles.perustiedotGrid}>
                    <div>{L('HENKILO_KANSALAISUUS')}</div>
                    <div data-testid="kansalaisuus">
                        {henkilo?.kansalaisuus
                            .map((k) => koodiLabelByKoodiarvo(kansalaisuusKoodisto, k.kansalaisuusKoodi, locale))
                            .join(', ')}
                    </div>
                    <div>{L('HENKILO_AIDINKIELI')}</div>
                    <div data-testid="aidinkieli">
                        {koodiLabelByKoodiarvo(kieliKoodisto, henkilo?.aidinkieli?.kieliKoodi.toUpperCase(), locale)}
                    </div>
                    <div>{L('HENKILO_SUKUPUOLI')}</div>
                    <div data-testid="sukupuoli">
                        {koodiLabelByKoodiarvo(sukupuoliKoodisto, henkilo?.sukupuoli, locale)}
                    </div>
                    <div>{L('HENKILO_OPPIJANUMERO')}</div>
                    <div data-testid="oppijanumero">{master?.oidHenkilo}</div>
                    <div>{L('HENKILO_OID')}</div>
                    <div data-testid="oid">{oid}</div>
                </div>
            </div>
            <div className={styles.buttonRow}>
                <button className="oph-ds-button oph-ds-button-bordered" onClick={() => openForm()}>
                    {L('MUOKKAA')}
                </button>
                <button className="oph-ds-button oph-ds-button-bordered" onClick={() => setPassword(true)}>
                    {L('SALASANA_ASETA')}
                </button>
                <button className="oph-ds-button oph-ds-button-bordered" onClick={() => setAnomusilmoitus(true)}>
                    {L('HENKILO_ANOMUSILMOITUKSET')}
                </button>
            </div>
        </>
    );
};

export const OmattiedotPerustiedot = ({ oid }: { oid: string }) => {
    const { L } = useLocalisations();
    const { data: henkilo, isLoading } = useGetHenkiloQuery(oid);
    const [isForm, setForm] = useState(false);

    const sectionId = useId();
    return (
        <section aria-labelledby={sectionId} className="henkiloViewUserContentWrapper" style={{ marginBottom: '2rem' }}>
            <h2 id={sectionId}>{L('OPPIJAN_PERUSTIEDOT')}</h2>
            <div className={styles.perustiedotContent}>
                {isLoading ? (
                    <OphDsSpinner />
                ) : isForm && henkilo ? (
                    <OmattiedotPerustiedotForm henkilo={henkilo} closeForm={() => setForm(false)} />
                ) : (
                    <OmattiedotPerustiedotView oid={oid} openForm={() => setForm(true)} />
                )}
            </div>
        </section>
    );
};
