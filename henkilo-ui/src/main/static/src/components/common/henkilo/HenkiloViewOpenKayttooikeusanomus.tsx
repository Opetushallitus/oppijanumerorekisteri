import React, { useEffect, useMemo, useState, useId } from 'react';
import { addYears, format, isBefore, parseISO } from 'date-fns';
import DatePicker from 'react-datepicker';
import { useReactTable, getCoreRowModel, getSortedRowModel, ColumnDef, Row, SortingState } from '@tanstack/react-table';

import { getOrganisationNameWithType } from '../StaticUtils';
import Button from '../button/Button';
import PopupButton from '../button/PopupButton';
import AnomusHylkaysPopup from '../../anomus/AnomusHylkaysPopup';
import { AnojaKayttooikeusryhmat } from '../../anomus/AnojaKayttooikeusryhmat';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { localizeTextGroup } from '../../../utilities/localisation.util';
import { KAYTTOOIKEUDENTILA, KayttooikeudenTila } from '../../../globals/KayttooikeudenTila';
import AccessRightDetails, { AccessRight, AccessRightDetaisLink } from './AccessRightDetails';
import { HenkilonNimi } from '../../../types/domain/kayttooikeus/HenkilonNimi';
import { useAppDispatch } from '../../../store';
import { useLocalisations } from '../../../selectors';
import { HaettuKayttooikeusryhma } from '../../../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types';
import { OphTableWithInfiniteScroll } from '../../OphTableWithInfiniteScroll';
import OphTable, { expanderColumn } from '../../OphTable';
import {
    useGetOrganisationsQuery,
    usePutHaettuKayttooikeusryhmaMutation,
    usePutPeruKayttooikeusAnomusMutation,
} from '../../../api/kayttooikeus';
import OphModal from '../modal/OphModal';
import ConfirmButton from '../button/ConfirmButton';
import { add } from '../../../slices/toastSlice';

import './HenkiloViewOpenKayttooikeusanomus.css';

type OwnProps = {
    anomukset: HaettuKayttooikeusryhma[];
    isOmattiedot: boolean;
    fetchMoreSettings?: {
        fetchMoreAction: () => void;
        isActive: boolean;
    };
    onSortingChange?: (sorting: SortingState) => void;
    tableLoading?: boolean;
    piilotaOtsikko?: boolean;
};

const emptyData: HaettuKayttooikeusryhma[] = [];
const emptyColumns: ColumnDef<HaettuKayttooikeusryhma>[] = [];

const HenkiloViewOpenKayttooikeusanomus = (props: OwnProps) => {
    const [sorting, setSorting] = useState<SortingState>([{ id: 'ANOTTU_PVM', desc: true }]);
    const dispatch = useAppDispatch();
    const { L, locale } = useLocalisations();
    const { data: organisations, isSuccess } = useGetOrganisationsQuery();
    const [putHaettuKayttooikeusryhma, { isLoading }] = usePutHaettuKayttooikeusryhmaMutation();
    const [peruKayttooikeusAnomus] = usePutPeruKayttooikeusAnomusMutation();
    const [dates, setDates] = useState<Record<string, { alkupvm: Date; loppupvm?: Date }>>(
        props.anomukset.reduce(
            (acc, kayttooikeus) => ({
                ...acc,
                [String(kayttooikeus.id)]: {
                    alkupvm: new Date(),
                    loppupvm: addYears(new Date(), 1),
                },
            }),
            {}
        ) ?? {}
    );
    const [accessRight, setAccessRight] = useState<AccessRight>();
    const [hylkaaAnomus, setHylkaaAnomus] = useState<number>();

    useEffect(() => {
        const currentDates = { ...dates };
        setDates(
            props.anomukset.reduce(
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
    }, [props.anomukset]);

    useEffect(() => (props.onSortingChange && sorting.length ? props.onSortingChange(sorting) : undefined), [sorting]);

    function createSelitePopupButton(perustelut: string) {
        return (
            <PopupButton
                popupClass={'oph-popup-default oph-popup-bottom'}
                popupButtonWrapperPositioning="relative"
                popupArrowStyles={{ marginLeft: '10px' }}
                popupButtonClasses={'oph-button oph-button-ghost anomuslistaus-avaabutton'}
                simple={true}
                disabled={!perustelut}
                popupContent={<p>{perustelut}</p>}
            >
                {L['AVAA']}
            </PopupButton>
        );
    }

    function anomusHandlingButtonsForOmattiedot(haettuKayttooikeusRyhma: HaettuKayttooikeusryhma) {
        return (
            <div>
                <div style={{ display: 'table-cell', paddingRight: '10px' }}>
                    <Button action={() => cancelAnomus(haettuKayttooikeusRyhma)}>
                        {L['HENKILO_KAYTTOOIKEUSANOMUS_PERU']}
                    </Button>
                </div>
            </div>
        );
    }

    function createNotificationMessage(henkilo: HenkilonNimi, messageKey: string): string {
        const message = L[messageKey];
        const henkiloLocalized = L['HENKILO_KAYTTOOIKEUSANOMUS_NOTIFICATIONS_HENKILON'];
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
            .then(() =>
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
                )
            )
            .catch((err) => {
                if (err.status === 403) {
                    dispatch(
                        add({
                            id: `anomus_${henkilo.oid}_${id}`,
                            type: 'error',
                            header: L['HENKILO_KAYTTOIKEUSANOMUS_OIKEUS_FAILURE'],
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
        setHylkaaAnomus(undefined);
    }

    function anomusHandlingButtonsForHenkilo(haettuKayttooikeusRyhma: HaettuKayttooikeusryhma) {
        const henkilo = haettuKayttooikeusRyhma.anomus.henkilo;
        return (
            <div>
                <div className="anomuslistaus-myonnabutton" style={{ display: 'table-cell', paddingRight: '10px' }}>
                    <ConfirmButton
                        action={() => handleAnomus(haettuKayttooikeusRyhma.id, KAYTTOOIKEUDENTILA.MYONNETTY, henkilo)}
                        normalLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_MYONNA']}
                        confirmLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_MYONNA_CONFIRM']}
                        disabled={!dates?.[haettuKayttooikeusRyhma.id]?.loppupvm || isLoading}
                    />
                </div>
                <div style={{ display: 'table-cell' }}>
                    <button
                        className="oph-button oph-button-cancel oph-button-small"
                        onClick={() => setHylkaaAnomus(haettuKayttooikeusRyhma.id)}
                    >
                        {L['HENKILO_KAYTTOOIKEUSANOMUS_HYLKAA']}
                    </button>
                </div>
            </div>
        );
    }

    async function cancelAnomus(haettuKayttooikeusRyhma: HaettuKayttooikeusryhma) {
        peruKayttooikeusAnomus(haettuKayttooikeusRyhma.id)
            .unwrap()
            .catch(() => {
                dispatch(
                    add({
                        id: `peru-kayttooikeus-error-${Math.random()}`,
                        type: 'error',
                        header: L['KAYTTOOIKEUSRYHMAT_ODOTTAMATON_VIRHE'],
                    })
                );
            });
    }

    function fetchKayttooikeusryhmatByAnoja({ row }: { row: Row<HaettuKayttooikeusryhma> }) {
        return <AnojaKayttooikeusryhmat henkiloOid={row.original.anomus.henkilo.oid} />;
    }

    function showAccessRightGroupDetails(kayttooikeusRyhma: Kayttooikeusryhma) {
        const accessRight: AccessRight = {
            name: localizeTextGroup(kayttooikeusRyhma.nimi.texts, locale),
            description: localizeTextGroup(
                [...(kayttooikeusRyhma.kuvaus?.texts || []), ...kayttooikeusRyhma.nimi.texts],
                locale
            ),
            onClose: () => setAccessRight(undefined),
        };
        setAccessRight(accessRight);
    }

    const columns = useMemo<ColumnDef<HaettuKayttooikeusryhma, HaettuKayttooikeusryhma>[]>(
        () => [
            expanderColumn(),
            {
                id: 'ANOTTU_PVM',
                header: () => L['ANOTTU_PVM'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => format(parseISO(getValue().anomus.anottuPvm), 'd.M.yyyy'),
                sortingFn: (a, b) =>
                    isBefore(parseISO(a.original.anomus.anottuPvm), parseISO(b.original.anomus.anottuPvm)) ? -1 : 1,
            },
            {
                id: 'HENKILO_KAYTTOOIKEUS_NIMI',
                header: () => L['HENKILO_KAYTTOOIKEUS_NIMI'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => getValue().anomus.henkilo.etunimet + ' ' + getValue().anomus.henkilo.sukunimi,
                enableSorting: false,
            },
            {
                id: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO',
                header: () => L['HENKILO_KAYTTOOIKEUS_ORGANISAATIO'],
                accessorFn: (row) => row,
                cell: ({ getValue }) =>
                    isSuccess
                        ? getOrganisationNameWithType(
                              organisations.find((o) => o.oid === getValue().anomus.organisaatioOid),
                              L,
                              locale
                          )
                        : '...',
                enableSorting: false,
            },
            {
                id: 'HENKILO_KAYTTOOIKEUSANOMUS_ANOTTU_RYHMA',
                header: () => L['HENKILO_KAYTTOOIKEUSANOMUS_ANOTTU_RYHMA'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => (
                    <AccessRightDetaisLink<Kayttooikeusryhma>
                        nimi={
                            getValue().kayttoOikeusRyhma.nimi.texts.filter(
                                (text) => text.lang === locale.toUpperCase()
                            )[0]?.text ?? ''
                        }
                        kayttooikeusRyhma={getValue().kayttoOikeusRyhma}
                        clickHandler={(kayttooikeusRyhma) => showAccessRightGroupDetails(kayttooikeusRyhma)}
                        buttonClass="anomuslistaus-detailsbutton"
                    />
                ),
                enableSorting: false,
            },
            {
                id: 'HENKILO_KAYTTOOIKEUSANOMUS_PERUSTELU',
                header: () => L['HENKILO_KAYTTOOIKEUSANOMUS_PERUSTELU'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => createSelitePopupButton(getValue().anomus.perustelut),
                enableSorting: false,
            },
            {
                id: 'HENKILO_KAYTTOOIKEUS_ALKUPVM',
                header: () => L['HENKILO_KAYTTOOIKEUS_ALKUPVM'],
                accessorFn: (row) => row,
                cell: ({ getValue }) =>
                    dates[getValue().id]?.alkupvm ? format(dates[getValue().id]!.alkupvm, 'd.M.yyyy') : '',
                enableSorting: false,
            },
            {
                id: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM',
                header: () => L['HENKILO_KAYTTOOIKEUS_LOPPUPVM'],
                accessorFn: (row) => row,
                cell: ({ getValue }) =>
                    dates[getValue().id]?.loppupvm ? format(dates[getValue().id]!.loppupvm!, 'd.M.yyyy') : '',
                enableSorting: false,
            },
            {
                id: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM_MYONTO',
                header: () => L['HENKILO_KAYTTOOIKEUS_LOPPUPVM'],
                accessorFn: (row) => row,
                enableSorting: false,
                cell: ({ getValue }) => (
                    <DatePicker
                        className="oph-input"
                        onChange={(value) =>
                            setDates({
                                ...dates,
                                [getValue().id]: {
                                    ...dates[getValue().id],
                                    loppupvm: value,
                                },
                            })
                        }
                        selected={dates[getValue().id]?.loppupvm}
                        showYearDropdown
                        showWeekNumbers
                        filterDate={(date) => isBefore(date, addYears(new Date(), 1))}
                        dateFormat={'d.M.yyyy'}
                    />
                ),
            },
            {
                id: 'HENKILO_KAYTTOOIKEUSANOMUS_TYYPPI',
                header: () => L['HENKILO_KAYTTOOIKEUSANOMUS_TYYPPI'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => L[getValue().anomus.anomusTyyppi],
                enableSorting: false,
            },
            {
                id: 'HENKILO_KAYTTOOIKEUSANOMUS_NAPIT',
                header: () => '',
                accessorFn: (row) => row,
                enableSorting: false,
                cell: ({ getValue }) =>
                    props.isOmattiedot
                        ? anomusHandlingButtonsForOmattiedot(getValue())
                        : anomusHandlingButtonsForHenkilo(getValue()),
            },
        ],
        [props.anomukset, dates, organisations, isSuccess]
    );

    const memoizedData = useMemo(() => {
        const renderedData = props.anomukset;
        if (!renderedData || !renderedData.length) {
            return undefined;
        }
        return renderedData;
    }, [props.anomukset]);

    const table = useReactTable({
        columns: columns ?? emptyColumns,
        pageCount: 1,
        data: memoizedData ?? emptyData,
        state: {
            sorting,
            columnVisibility: {
                expander: !props.isOmattiedot,
                HENKILO_KAYTTOOIKEUS_NIMI: !props.isOmattiedot,
                HENKILO_KAYTTOOIKEUS_LOPPUPVM: props.isOmattiedot,
                HENKILO_KAYTTOOIKEUS_LOPPUPVM_MYONTO: !props.isOmattiedot,
            },
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getRowCanExpand: () => true,
    });

    const hylattyKayttooikeusryhma = hylkaaAnomus && props.anomukset.find((a) => a.id === hylkaaAnomus);
    const sectionLabelId = useId();
    return (
        <section aria-labelledby={sectionLabelId} className="henkiloViewUserContentWrapper">
            {hylattyKayttooikeusryhma && (
                <OphModal
                    title={L['HENKILO_KAYTTOOIKEUSANOMUS_HYLKAA_HAKEMUS']}
                    onClose={() => setHylkaaAnomus(undefined)}
                    onOverlayClick={() => setHylkaaAnomus(undefined)}
                >
                    <AnomusHylkaysPopup
                        kayttooikeusryhma={hylattyKayttooikeusryhma}
                        updateHaettuKayttooikeusryhma={handleAnomus}
                    />
                </OphModal>
            )}
            {accessRight && <AccessRightDetails {...accessRight} />}
            <div>
                {!props.piilotaOtsikko && <h2 id={sectionLabelId}>{L['HENKILO_AVOIMET_KAYTTOOIKEUDET_OTSIKKO']}</h2>}
                {props.fetchMoreSettings ? (
                    <OphTableWithInfiniteScroll
                        table={table}
                        isLoading={!!props.tableLoading}
                        fetch={props.fetchMoreSettings?.fetchMoreAction}
                        isActive={props.fetchMoreSettings?.isActive}
                        renderSubComponent={!props.isOmattiedot ? fetchKayttooikeusryhmatByAnoja : undefined}
                    />
                ) : (
                    <OphTable
                        table={table}
                        isLoading={!!props.tableLoading}
                        renderSubComponent={!props.isOmattiedot ? fetchKayttooikeusryhmatByAnoja : undefined}
                    />
                )}
            </div>
        </section>
    );
};

export default HenkiloViewOpenKayttooikeusanomus;
