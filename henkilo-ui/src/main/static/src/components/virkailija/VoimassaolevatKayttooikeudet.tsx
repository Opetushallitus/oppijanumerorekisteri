import React, { MutableRefObject, useEffect, useId, useMemo, useState } from 'react';
import { addYears, format, parseISO } from 'date-fns';

import { OphDsBanner } from '../design-system/OphDsBanner';
import { OphDsDatepicker } from '../design-system/OphDsDatePicker';
import { OphDsTable, SortOrder } from '../design-system/OphDsTable';
import { useAppDispatch } from '../../store';
import { getOrganisationNameWithType } from '../common/StaticUtils';
import { MyonnettyKayttooikeusryhma } from '../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { KAYTTOOIKEUDENTILA } from '../../globals/KayttooikeudenTila';
import { getTextGroupLocalisation } from '../../utilities/localisation.util';
import { useLocalisations } from '../../selectors';
import {
    useDeleteKayttooikeusryhmaForHenkiloMutation,
    useGetKayttooikeusryhmasForHenkiloQuery,
    useGetOrganisationsQuery,
    usePutKayttooikeusryhmaForHenkiloMutation,
} from '../../api/kayttooikeus';
import ConfirmButton from '../common/button/ConfirmButton';
import { add } from '../../slices/toastSlice';
import { useGetHenkiloQuery } from '../../api/oppijanumerorekisteri';
import OphModal from '../common/modal/OphModal';

type OwnProps = {
    oidHenkilo: string;
    isPalvelukayttaja?: boolean;
    existingKayttooikeusRef: MutableRefObject<HTMLDivElement | null>;
};

type KayttooikeusDetails = {
    name: string;
    description: string;
};

type RenderedData = (MyonnettyKayttooikeusryhma & {
    organisaatioNimi: string;
    ryhmaNimi: string;
    kasittely: string;
})[];

export const VoimassaolevatKayttooikeudet = (props: OwnProps) => {
    const { L, locale } = useLocalisations();
    const { data: kayttooikeusryhmas, isLoading, isError } = useGetKayttooikeusryhmasForHenkiloQuery(props.oidHenkilo);
    const [putKayttooikeusryhma] = usePutKayttooikeusryhmaForHenkiloMutation();
    const [deleteKayttooikeusryhma] = useDeleteKayttooikeusryhmaForHenkiloMutation();
    const dispatch = useAppDispatch();
    const { data: henkilo } = useGetHenkiloQuery(props.oidHenkilo);
    const { data: organisations, isSuccess } = useGetOrganisationsQuery();
    const [dates, setDates] = useState<Record<number, { alkupvm: Date; loppupvm: Date }>>([]);
    const [kayttooikeus, setKayttooikeus] = useState<KayttooikeusDetails>();
    const [sortOrder, setSortOrder] = useState<SortOrder>();

    useEffect(() => {
        if (kayttooikeusryhmas?.length) {
            setDates(
                kayttooikeusryhmas.filter(_filterExpiredKayttooikeus).reduce(
                    (acc, kayttooikeus) => ({
                        ...acc,
                        [kayttooikeus.ryhmaId]: {
                            alkupvm: new Date(),
                            loppupvm:
                                props.isPalvelukayttaja && kayttooikeus.voimassaPvm
                                    ? addYears(parseISO(kayttooikeus.voimassaPvm), 1)
                                    : addYears(new Date(), 1),
                        },
                    }),
                    {}
                )
            );
        }
    }, [henkilo, kayttooikeusryhmas]);

    function loppupvmAction(value: Date, ryhmaId: number) {
        const newDates = { ...dates };
        if (newDates[ryhmaId]) {
            newDates[ryhmaId].loppupvm = value;
        }
        setDates(newDates);
    }

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

    const myonnaJatkoaikaa = async (kayttooikeus: MyonnettyKayttooikeusryhma) => {
        const date = dates[kayttooikeus.ryhmaId];
        putKayttooikeusryhma({
            henkiloOid: props.oidHenkilo,
            organisationOid: kayttooikeus.organisaatioOid,
            body: [
                {
                    id: kayttooikeus.ryhmaId,
                    kayttoOikeudenTila: KAYTTOOIKEUDENTILA.MYONNETTY,
                    alkupvm: date?.alkupvm ? format(date.alkupvm, 'yyyy-MM-dd') : '',
                    loppupvm: date?.loppupvm ? format(date.loppupvm, 'yyyy-MM-dd') : '',
                },
            ],
        })
            .unwrap()
            .then(() => {
                dispatch(
                    add({
                        id: `jatkoaika-ok-${Math.random()}`,
                        type: 'ok',
                        header: L('NOTIFICATION_LISAA_KAYTTOOIKEUS_ONNISTUI'),
                    })
                );
            })
            .catch(() => {
                dispatch(
                    add({
                        id: `jatkoaika-error-${Math.random()}`,
                        type: 'error',
                        header: L('NOTIFICATION_LISAA_KAYTTOOIKEUS_EPAONNISTUI'),
                    })
                );
            });
    };

    const renderedData: RenderedData = useMemo(() => {
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
                        L('HENKILO_KAYTTOOIKEUS_JATKOAIKA'),
                        L('HENKILO_KAYTTOOIKEUS_SULJE'),
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
                        <div key={`m-${k.ryhmaId}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <OphDsDatepicker
                                onChange={(date: Date | null) => date && loppupvmAction(date, k.ryhmaId)}
                                selected={dates[k.ryhmaId]?.loppupvm}
                                minDate={new Date()}
                                maxDate={addYears(new Date(), props.isPalvelukayttaja ? 100 : 1)}
                                dateFormat="d.M.yyyy"
                                tiny={true}
                            />
                            <ConfirmButton
                                className="oph-ds-button oph-ds-button-bordered"
                                action={() => myonnaJatkoaikaa(k)}
                                normalLabel={L('HENKILO_KAYTTOOIKEUSANOMUS_MYONNA')}
                                confirmLabel={L('HENKILO_KAYTTOOIKEUSANOMUS_MYONNA_CONFIRM')}
                            />
                        </div>,
                        <div key={`sulje-${k.ryhmaId}`} style={{ textAlign: 'right' }}>
                            <ConfirmButton
                                className="oph-ds-button oph-ds-button-transparent oph-ds-button-icon oph-ds-icon-button-delete"
                                action={() =>
                                    deleteKayttooikeusryhma({
                                        henkiloOid: props.oidHenkilo,
                                        organisationOid: k.organisaatioOid,
                                        kayttooikeusryhmaId: k.ryhmaId,
                                    })
                                }
                                normalLabel={L('HENKILO_KAYTTOOIKEUSANOMUS_SULJE')}
                                confirmLabel={L('HENKILO_KAYTTOOIKEUSANOMUS_SULJE_CONFIRM')}
                                disabled={false}
                            />
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
