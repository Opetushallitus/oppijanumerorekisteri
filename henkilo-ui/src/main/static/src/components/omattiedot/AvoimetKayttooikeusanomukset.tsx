import React, { useMemo, useState, useId, ReactNode } from 'react';
import { format, parseISO } from 'date-fns';

import { Kayttooikeusryhma } from '../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { localizeTextGroup } from '../../utilities/localisation.util';
import { useAppDispatch } from '../../store';
import { useLocalisations } from '../../selectors';
import { HaettuKayttooikeusryhma } from '../../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types';
import {
    useGetKayttooikeusAnomuksetForHenkiloQuery,
    useGetOrganisationsQuery,
    usePutPeruKayttooikeusAnomusMutation,
} from '../../api/kayttooikeus';
import OphModal from '../common/modal/OphModal';
import { add } from '../../slices/toastSlice';
import { OphDsTable } from '../design-system/OphDsTable';
import { getOrganisationNameWithType } from '../common/StaticUtils';

type OwnProps = {
    oidHenkilo: string;
};

export const AvoimetKayttooikeusanomukset = ({ oidHenkilo }: OwnProps) => {
    const dispatch = useAppDispatch();
    const { L, locale } = useLocalisations();
    const { data: organisations } = useGetOrganisationsQuery();
    const { data: anomukset, isLoading } = useGetKayttooikeusAnomuksetForHenkiloQuery(oidHenkilo);
    const [peruKayttooikeusAnomus] = usePutPeruKayttooikeusAnomusMutation();
    const [modal, setModal] = useState<{ title: string; content: ReactNode } | null>(null);

    function showKayttooikeusDetails(kayttooikeusRyhma: Kayttooikeusryhma) {
        setModal({
            title: localizeTextGroup(kayttooikeusRyhma.nimi.texts, locale),
            content: (
                <p>
                    {localizeTextGroup(
                        [...(kayttooikeusRyhma.kuvaus?.texts || []), ...kayttooikeusRyhma.nimi.texts],
                        locale
                    )}
                </p>
            ),
        });
    }

    async function cancelAnomus(haettuKayttooikeusRyhma: HaettuKayttooikeusryhma) {
        peruKayttooikeusAnomus(haettuKayttooikeusRyhma.id)
            .unwrap()
            .catch(() => {
                dispatch(
                    add({
                        id: `peru-kayttooikeus-error-${Math.random()}`,
                        type: 'error',
                        header: L('KAYTTOOIKEUSRYHMAT_ODOTTAMATON_VIRHE'),
                    })
                );
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
                        '',
                    ]}
                    rows={renderedData.map((a) => {
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
                            <button key={`cancel-${a.id}`} className="oph-ds-button" onClick={() => cancelAnomus(a)}>
                                {L('HENKILO_KAYTTOOIKEUSANOMUS_PERU')}
                            </button>,
                        ];
                    })}
                    isFetching={isLoading}
                />
            )}
        </section>
    );
};
