import React, { MutableRefObject, useEffect, useId, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';

import { OphDsBanner } from '../design-system/OphDsBanner';
import { OphDsTable, SortOrder } from '../design-system/OphDsTable';
import { useAppDispatch } from '../../store';
import { getOrganisationNameWithType } from '../common/StaticUtils';
import { MyonnettyKayttooikeusryhma } from '../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { KAYTTOOIKEUDENTILA } from '../../globals/KayttooikeudenTila';
import { getTextGroupLocalisation } from '../../utilities/localisation.util';
import { useLocalisations } from '../../selectors';
import {
    useGetKayttooikeusryhmasForHenkiloQuery,
    useGetOrganisationsQuery,
    usePostKayttooikeusAnomusMutation,
} from '../../api/kayttooikeus';
import ConfirmButton from '../common/button/ConfirmButton';
import { add } from '../../slices/toastSlice';
import OphModal from '../common/modal/OphModal';
import { HaeJatkoaikaa } from './HaeJatkoaikaa';
import { parseWorkEmails } from '../../utilities/henkilo.util';
import { useGetHenkiloQuery } from '../../api/oppijanumerorekisteri';

type OwnProps = {
    oidHenkilo: string;
    existingKayttooikeusRef?: MutableRefObject<HTMLDivElement | null>;
};

type KayttooikeusDetails = {
    name: string;
    description: string;
};

type RenderedData = MyonnettyKayttooikeusryhma & {
    organisaatioNimi: string;
    ryhmaNimi: string;
    kasittely: string;
};

export const VoimassaolevatKayttooikeudet = (props: OwnProps) => {
    const { L, locale } = useLocalisations();
    const dispatch = useAppDispatch();
    const { data: organisations, isSuccess } = useGetOrganisationsQuery();
    const { data: kayttooikeusryhmas, isLoading, isError } = useGetKayttooikeusryhmasForHenkiloQuery(props.oidHenkilo);
    const { data: henkilo } = useGetHenkiloQuery(props.oidHenkilo);
    const [postKayttooikeusAnomus] = usePostKayttooikeusAnomusMutation();
    const [kayttooikeus, setKayttooikeus] = useState<KayttooikeusDetails>();
    const [sortOrder, setSortOrder] = useState<SortOrder>();
    const [jatkoaikaAnomus, setJatkoaikaAnomus] = useState<MyonnettyKayttooikeusryhma>();
    const [emails, setEmails] = useState<string[]>([]);

    useEffect(() => {
        setEmails(parseWorkEmails(henkilo?.yhteystiedotRyhma));
    }, [henkilo]);

    function showKayttooikeusDetails(kayttooikeusRyhma: MyonnettyKayttooikeusryhma) {
        setKayttooikeus({
            name: getTextGroupLocalisation(kayttooikeusRyhma.ryhmaNames, locale),
            description: getTextGroupLocalisation(kayttooikeusRyhma.ryhmaKuvaus, locale),
        });
    }

    function _filterExpiredKayttooikeus(kayttooikeus: MyonnettyKayttooikeusryhma) {
        return (
            kayttooikeus.tila !== KAYTTOOIKEUDENTILA.SULJETTU && kayttooikeus.tila !== KAYTTOOIKEUDENTILA.VANHENTUNUT
        );
    }

    async function createJatkoaikaAnomus(d: MyonnettyKayttooikeusryhma, email: string) {
        await postKayttooikeusAnomus({
            organisaatioOrRyhmaOid: d.organisaatioOid,
            email,
            perustelut: 'Uusiminen',
            kayttooikeusRyhmaIds: [d.ryhmaId],
            anojaOid: props.oidHenkilo,
        })
            .unwrap()
            .then(() => {
                dispatch(
                    add({
                        id: `anomus-ok-${Math.random()}`,
                        type: 'ok',
                        header: L('OMATTIEDOT_ANOMUKSEN_TALLENNUS_OK'),
                    })
                );
                setJatkoaikaAnomus(undefined);
            })
            .catch(() => {
                dispatch(
                    add({
                        id: `anomus-error-${Math.random()}`,
                        type: 'error',
                        header: L('OMATTIEDOT_ANOMUKSEN_TALLENNUS_VIRHEILMOITUS'),
                    })
                );
            });
    }

    const renderedData: RenderedData[] = useMemo(() => {
        const renderedData = (kayttooikeusryhmas ?? []).filter(_filterExpiredKayttooikeus).map((k) => ({
            ...k,
            organisaatioNimi: getOrganisationNameWithType(organisations, k.organisaatioOid, L, locale),
            ryhmaNimi: k.ryhmaNames?.texts.filter((text) => text.lang === locale.toUpperCase())[0]?.text ?? '',
            kasittely: format(parseISO(k.kasitelty), 'd.M.yyyy') + ' / ' + (k.kasittelijaNimi || k.kasittelijaOid),
        }));
        if (sortOrder) {
            const { sortBy, asc } = sortOrder;
            switch (sortBy) {
                case L('HENKILO_KAYTTOOIKEUS_ORGANISAATIO_TEHTAVA'):
                    renderedData?.sort((a, b) =>
                        asc
                            ? a.organisaatioNimi.localeCompare(b.organisaatioNimi)
                            : b.organisaatioNimi.localeCompare(a.organisaatioNimi)
                    );
                    break;
                case L('HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS'):
                    renderedData?.sort((a, b) =>
                        asc ? a.ryhmaNimi.localeCompare(b.ryhmaNimi) : b.ryhmaNimi.localeCompare(a.ryhmaNimi)
                    );
                    break;
                case L('HENKILO_KAYTTOOIKEUS_ALKUPVM'):
                    renderedData?.sort((a, b) =>
                        asc
                            ? (a.alkuPvm ?? '').localeCompare(b.alkuPvm ?? '')
                            : (b.alkuPvm ?? '').localeCompare(a.alkuPvm ?? '')
                    );
                    break;
                case L('HENKILO_KAYTTOOIKEUS_KASITTELIJA'):
                    renderedData?.sort((a, b) =>
                        asc ? a.kasittely.localeCompare(b.kasittely) : b.kasittely.localeCompare(a.kasittely)
                    );
                    break;
            }
        }
        return renderedData;
    }, [kayttooikeusryhmas, organisations, isSuccess, sortOrder]);

    const sectionLabelId = useId();
    return (
        <section aria-labelledby={sectionLabelId} className="henkiloViewUserContentWrapper">
            <h2 id={sectionLabelId}>{L('HENKILO_OLEVAT_KAYTTOOIKEUDET_OTSIKKO')}</h2>
            {kayttooikeus && (
                <OphModal
                    title={kayttooikeus.name}
                    onClose={() => setKayttooikeus(undefined)}
                    onOverlayClick={() => setKayttooikeus(undefined)}
                >
                    <p>{kayttooikeus.description}</p>
                </OphModal>
            )}
            {jatkoaikaAnomus && (
                <OphModal
                    title={L('OMATTIEDOT_HAE_JATKOAIKAA')}
                    onClose={() => setJatkoaikaAnomus(undefined)}
                    onOverlayClick={() => setJatkoaikaAnomus(undefined)}
                >
                    <HaeJatkoaikaa
                        anomus={jatkoaikaAnomus}
                        oid={props.oidHenkilo}
                        onCancel={() => setJatkoaikaAnomus(undefined)}
                        onCreate={(email: string) => createJatkoaikaAnomus(jatkoaikaAnomus, email)}
                    />
                </OphModal>
            )}
            {isError ? (
                <OphDsBanner type="error">
                    <p>{L('KAYTTOOIKEUSRYHMAT_ODOTTAMATON_VIRHE')}</p>
                </OphDsBanner>
            ) : !isLoading && renderedData.length === 0 ? (
                <p>{L('HENKILO_KAYTTOOIKEUS_VOIMASSAOLEVAT_TYHJA')}</p>
            ) : (
                <OphDsTable
                    headers={[
                        L('HENKILO_KAYTTOOIKEUS_ORGANISAATIO_TEHTAVA'),
                        L('HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS'),
                        L('HENKILO_KAYTTOOIKEUS_ALKUPVM'),
                        L('HENKILO_KAYTTOOIKEUS_KASITTELIJA'),
                        L('OMATTIEDOT_HAE_JATKOAIKAA'),
                    ]}
                    rows={renderedData.map((k) => [
                        k.organisaatioNimi,
                        <button
                            key={`details-${k.ryhmaId}`}
                            className="oph-ds-button oph-ds-button-transparent oph-ds-button-text-link"
                            onClick={() => showKayttooikeusDetails(k)}
                        >
                            {k.ryhmaNimi}
                        </button>,
                        k.alkuPvm && format(parseISO(k.alkuPvm), 'd.M.yyyy'),
                        k.kasittely,
                        <div key={`m-${k.ryhmaId}`}>
                            {emails.length === 1 ? (
                                <ConfirmButton
                                    className="oph-ds-button"
                                    action={() => createJatkoaikaAnomus(k, emails[0] ?? '')}
                                    normalLabel={L('OMATTIEDOT_HAE_JATKOAIKAA')}
                                    confirmLabel={L('OMATTIEDOT_HAE_JATKOAIKAA_CONFIRM')}
                                />
                            ) : (
                                <button className="oph-ds-button" onClick={() => setJatkoaikaAnomus(k)}>
                                    {L('OMATTIEDOT_HAE_JATKOAIKAA')}
                                </button>
                            )}
                        </div>,
                    ])}
                    isFetching={isLoading}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                />
            )}
        </section>
    );
};
