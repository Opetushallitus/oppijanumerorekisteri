import React, { useEffect, useMemo, useState, useId, ReactNode } from 'react';
import { addYears, format, parseISO } from 'date-fns';

import AnomusHylkaysPopup from '../anomus/AnomusHylkaysPopup';
import { getTextGroupLocalisation } from '../../utilities/localisation.util';
import {
    KAYTTOOIKEUDENTILA,
    Kayttooikeusryhma,
    KayttooikeudenTila,
} from '../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { HenkilonNimi } from '../../types/domain/kayttooikeus/HenkilonNimi';
import { useAppDispatch } from '../../store';
import { useLocalisations } from '../../selectors';
import { HaettuKayttooikeusryhma } from '../../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types';
import {
    useGetKayttooikeusAnomuksetForHenkiloQuery,
    useGetOrganisationsQuery,
    usePutHaettuKayttooikeusryhmaMutation,
} from '../../api/kayttooikeus';
import OphModal from '../common/modal/OphModal';
import ConfirmButton from '../common/button/ConfirmButton';
import { add } from '../../slices/toastSlice';
import { OphDsTable } from '../design-system/OphDsTable';
import { OphDsDatepicker } from '../design-system/OphDsDatePicker';
import { getOrganisationNameWithType } from '../common/StaticUtils';

type OwnProps = {
    oidHenkilo: string;
};

export const AvoimetKayttooikeusanomukset = ({ oidHenkilo }: OwnProps) => {
    const dispatch = useAppDispatch();
    const { L, locale } = useLocalisations();
    const { data: organisations } = useGetOrganisationsQuery();
    const { data: anomukset } = useGetKayttooikeusAnomuksetForHenkiloQuery(oidHenkilo);
    const [putHaettuKayttooikeusryhma, { isLoading }] = usePutHaettuKayttooikeusryhmaMutation();
    const [dates, setDates] = useState<Record<string, { alkupvm: Date; loppupvm?: Date }>>({});
    const [modal, setModal] = useState<{ title: string; content: ReactNode } | null>(null);

    useEffect(() => {
        const currentDates = { ...dates };
        setDates(
            anomukset?.reduce(
                (acc, kayttooikeus) => ({
                    ...acc,
                    [String(kayttooikeus.id)]: dates[String(kayttooikeus.id)] ?? {
                        alkupvm: new Date(),
                        loppupvm: addYears(new Date(), 1),
                    },
                }),
                currentDates
            ) ?? {}
        );
    }, [anomukset]);

    function createNotificationMessage(henkilo: HenkilonNimi, messageKey: string): string {
        const message = L(messageKey);
        const henkiloLocalized = L('HENKILO_KAYTTOOIKEUSANOMUS_NOTIFICATIONS_HENKILON');
        const etunimet = henkilo.etunimet;
        const sukunimi = henkilo.sukunimi;
        const oid = henkilo.oid;
        return `${henkiloLocalized} ${etunimet} ${sukunimi} (${oid}): ${message}`;
    }

    async function handleAnomus(
        id: number,
        kayttoOikeudenTila: KayttooikeudenTila,
        henkilo: HenkilonNimi,
        hylkaysperuste?: string
    ) {
        const date = dates[id];
        const alkupvm = format(date?.alkupvm ?? new Date(), 'yyyy-MM-dd');
        const loppupvm = date?.loppupvm && format(date?.loppupvm, 'yyyy-MM-dd');
        await putHaettuKayttooikeusryhma({
            henkiloOid: henkilo.oid,
            body: { id, kayttoOikeudenTila, alkupvm, loppupvm, hylkaysperuste },
        })
            .unwrap()
            .then(() => {
                dispatch(
                    add({
                        id: `anomus_${henkilo.oid}_${id}`,
                        type: 'ok',
                        header: createNotificationMessage(
                            henkilo,
                            kayttoOikeudenTila === KAYTTOOIKEUDENTILA.HYLATTY
                                ? 'HENKILO_KAYTTOOIKEUSANOMUS_HYLKAYS_SUCCESS'
                                : 'HENKILO_KAYTTOOIKEUSANOMUS_HYVAKSYMINEN_SUCCESS'
                        ),
                    })
                );
                setModal(null);
            })
            .catch((err) => {
                if (err.status === 403) {
                    dispatch(
                        add({
                            id: `anomus_${henkilo.oid}_${id}`,
                            type: 'error',
                            header: L('HENKILO_KAYTTOIKEUSANOMUS_OIKEUS_FAILURE'),
                        })
                    );
                } else {
                    dispatch(
                        add({
                            id: `anomus_${henkilo.oid}_${id}`,
                            type: 'error',
                            header: createNotificationMessage(
                                henkilo,
                                kayttoOikeudenTila === KAYTTOOIKEUDENTILA.HYLATTY
                                    ? 'HENKILO_KAYTTOOIKEUSANOMUS_HYLKAYS_FAILURE'
                                    : 'HENKILO_KAYTTOOIKEUSANOMUS_HYVAKSYMINEN_FAILURE'
                            ),
                        })
                    );
                }
            });
    }

    function showKayttooikeusDetails(kayttooikeusRyhma: Kayttooikeusryhma) {
        setModal({
            title: getTextGroupLocalisation(kayttooikeusRyhma.nimi, locale),
            content: <p>{getTextGroupLocalisation(kayttooikeusRyhma.kuvaus, locale)}</p>,
        });
    }

    const renderedData: (HaettuKayttooikeusryhma & { organisaatioNimi: string; ryhmaNimi: string })[] = useMemo(() => {
        const renderedData = (anomukset ?? []).map((a) => ({
            ...a,
            organisaatioNimi: getOrganisationNameWithType(organisations, a.anomus.organisaatioOid, L, locale),
            ryhmaNimi:
                a.kayttoOikeusRyhma.nimi.texts.filter((text) => text.lang === locale.toUpperCase())[0]?.text ?? '',
        }));
        return renderedData;
    }, [anomukset, organisations]);

    const sectionLabelId = useId();
    return (
        <section aria-labelledby={sectionLabelId} className="henkiloViewUserContentWrapper">
            <h2 id={sectionLabelId}>{L('HENKILO_AVOIMET_KAYTTOOIKEUDET_OTSIKKO')}</h2>
            {modal && (
                <OphModal title={modal.title} onClose={() => setModal(null)} onOverlayClick={() => setModal(null)}>
                    {modal.content}
                </OphModal>
            )}
            {!isLoading && renderedData.length === 0 ? (
                <p>{L('HENKILO_KAYTTOOIKEUS_AVOIN_TYHJA')}</p>
            ) : (
                <OphDsTable
                    headers={[
                        L('ANOTTU_PVM'),
                        L('HENKILO_KAYTTOOIKEUS_ORGANISAATIO'),
                        L('HENKILO_KAYTTOOIKEUSANOMUS_ANOTTU_RYHMA'),
                        L('HENKILO_KAYTTOOIKEUSANOMUS_PERUSTELU'),
                        L('HENKILO_KAYTTOOIKEUS_ALKUPVM'),
                        L('HENKILO_KAYTTOOIKEUS_LOPPUPVM'),
                        '',
                    ]}
                    rows={renderedData.map((a) => {
                        const date = dates[a.id];
                        return [
                            format(parseISO(a.anomus.anottuPvm), 'd.M.yyyy'),
                            a.organisaatioNimi,
                            <button
                                key={`details-${a.id}`}
                                className="oph-ds-button oph-ds-button-transparent oph-ds-button-text-link"
                                onClick={() => showKayttooikeusDetails(a.kayttoOikeusRyhma)}
                            >
                                {a.ryhmaNimi}
                            </button>,
                            <button
                                key={`perustelu-${a.id}`}
                                className="oph-ds-button oph-ds-button-transparent oph-ds-button-text-link"
                                onClick={() =>
                                    setModal({
                                        title: L('HENKILO_KAYTTOOIKEUSANOMUS_PERUSTELU'),
                                        content: <p>{a.anomus.perustelut}</p>,
                                    })
                                }
                            >
                                {L('AVAA')}
                            </button>,
                            date?.alkupvm ? format(date.alkupvm, 'd.M.yyyy') : '',
                            <OphDsDatepicker
                                key={`date-${a.id}`}
                                onChange={(value: Date | null) =>
                                    setDates({
                                        ...dates,
                                        [a.id]: {
                                            ...dates[a.id],
                                            loppupvm: value,
                                        },
                                    })
                                }
                                selected={date?.loppupvm}
                                minDate={new Date()}
                                maxDate={addYears(new Date(), 1)}
                                tiny
                            />,
                            <div key={`buttons-${a.id}`} style={{ display: 'flex', gap: '0.5rem' }}>
                                <ConfirmButton
                                    className="oph-ds-button"
                                    action={() => handleAnomus(a.id, KAYTTOOIKEUDENTILA.MYONNETTY, a.anomus.henkilo)}
                                    normalLabel={L('HENKILO_KAYTTOOIKEUSANOMUS_MYONNA')}
                                    confirmLabel={L('HENKILO_KAYTTOOIKEUSANOMUS_MYONNA_CONFIRM')}
                                    disabled={!date?.loppupvm || isLoading}
                                />
                                <button
                                    className="oph-ds-button oph-ds-button-bordered"
                                    onClick={() =>
                                        setModal({
                                            title: L('HENKILO_KAYTTOOIKEUSANOMUS_HYLKAA_HAKEMUS'),
                                            content: <AnomusHylkaysPopup anomus={a} handleAnomus={handleAnomus} />,
                                        })
                                    }
                                >
                                    {L('HENKILO_KAYTTOOIKEUSANOMUS_HYLKAA')}
                                </button>
                            </div>,
                        ];
                    })}
                    isFetching={isLoading}
                />
            )}
        </section>
    );
};
