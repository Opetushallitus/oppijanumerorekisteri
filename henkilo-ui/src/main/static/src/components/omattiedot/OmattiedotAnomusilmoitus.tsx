import React, { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';

import {
    useGetKayttooikeusryhmaByKayttooikeusQuery,
    useGetOmattiedotQuery,
    usePutAnomusilmoitusMutation,
} from '../../api/kayttooikeus';
import { useLocalisations } from '../../selectors';
import { selectStyles } from '../../utilities/select';
import { getTextGroupLocalisation } from '../../utilities/localisation.util';

import styles from './OmattiedotAnomusilmoitus.module.css';

type Props = {
    onClose: () => void;
};

export const OmattiedotAnomusilmoitus = ({ onClose }: Props) => {
    const { L, locale } = useLocalisations();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const [putAnomusilmoitus] = usePutAnomusilmoitusMutation();
    const { data: vastuukayttajaRyhmat } = useGetKayttooikeusryhmaByKayttooikeusQuery('VASTUUKAYTTAJAT');
    const [anomusilmoitus, setAnomusilmoitus] = useState<number[]>([]);

    const options = useMemo(
        () =>
            vastuukayttajaRyhmat
                ?.map((vastuukayttajaRyhma) => ({
                    value: vastuukayttajaRyhma.id,
                    label: getTextGroupLocalisation(vastuukayttajaRyhma.nimi, locale),
                }))
                .filter((o) => !anomusilmoitus.includes(o.value))
                .sort((a, b) => (a.label ?? '').localeCompare(b.label ?? '')) ?? [],

        [vastuukayttajaRyhmat, omattiedot, anomusilmoitus]
    );

    useEffect(() => {
        setAnomusilmoitus(omattiedot?.anomusilmoitus ?? []);
    }, [omattiedot]);

    async function updateAnomusilmoitus() {
        if (!omattiedot) {
            return;
        }
        await putAnomusilmoitus({
            oid: omattiedot.oidHenkilo,
            anomusilmoitus,
        })
            .unwrap()
            .then(onClose);
    }

    return (
        <div className={styles.modalContent}>
            <Select
                {...selectStyles}
                inputId="anomusilmoitusSelect"
                placeholder={L('HENKILO_ANOMUSILMOITUKSET')}
                options={options}
                onChange={(a) => a && setAnomusilmoitus([...anomusilmoitus, a?.value])}
            />
            {anomusilmoitus.length > 0 && (
                <div className="anomusilmoitus-rows">
                    {anomusilmoitus
                        .map((a) => vastuukayttajaRyhmat?.find((v) => v.id === a))
                        .map((v) => (
                            <div className={styles.anomusilmoitusRow} key={v?.id}>
                                <span>{getTextGroupLocalisation(v?.nimi, locale)}</span>
                                <button
                                    className="oph-ds-button oph-ds-button-bordered oph-ds-icon-button oph-ds-icon-button-delete"
                                    title={L('POISTA')}
                                    onClick={() => setAnomusilmoitus(anomusilmoitus.filter((a) => a !== v?.id))}
                                />
                            </div>
                        ))}
                </div>
            )}
            <div className={styles.buttons}>
                <button className="oph-ds-button" onClick={updateAnomusilmoitus}>
                    {L('TALLENNA')}
                </button>
                <button className="oph-ds-button oph-ds-button-bordered" onClick={onClose}>
                    {L('PERUUTA')}
                </button>
            </div>
        </div>
    );
};
