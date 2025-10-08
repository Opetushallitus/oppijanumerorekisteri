import React, { useEffect, useMemo, useState, useId } from 'react';
import moment from 'moment';
import type { Moment } from 'moment';
import DatePicker from 'react-datepicker';
import { useReactTable, getCoreRowModel, getSortedRowModel, ColumnDef, Row, SortingState } from '@tanstack/react-table';

import StaticUtils from '../StaticUtils';
import Button from '../button/Button';
import PopupButton from '../button/PopupButton';
import AnomusHylkaysPopup from '../../anomus/AnomusHylkaysPopup';
import PropertySingleton from '../../../globals/PropertySingleton';
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
    updateSuccessHandler?: (id: number, henkilo: HenkilonNimi, kayttooikeudenTila: KayttooikeudenTila) => void;
    updateErrorHandler?: (id: number, henkilo: HenkilonNimi, kayttooikeudenTila: KayttooikeudenTila) => void;
};

const emptyArray = [];

const HenkiloViewOpenKayttooikeusanomus = (props: OwnProps) => {
    const [sorting, setSorting] = useState<SortingState>([{ id: 'ANOTTU_PVM', desc: true }]);
    const dispatch = useAppDispatch();
    const { L, locale } = useLocalisations();
    const { data: organisations, isSuccess } = useGetOrganisationsQuery();
    const [putHaettuKayttooikeusryhma] = usePutHaettuKayttooikeusryhmaMutation();
    const [peruKayttooikeusAnomus] = usePutPeruKayttooikeusAnomusMutation();
    const [dates, setDates] = useState<{ [anomusId: number]: { alkupvm: Moment; loppupvm?: Moment } }>(
        props.anomukset.reduce(
            (acc, kayttooikeus) => ({
                ...acc,
                [String(kayttooikeus.id)]: {
                    alkupvm: moment(),
                    loppupvm: moment().add(1, 'years'),
                },
            }),
            {}
        ) ?? {}
    );
    const [handledAnomusIds, setHandledAnomusIds] = useState<number[]>([]);
    const [accessRight, setAccessRight] = useState<AccessRight>();
    const [hylkaaAnomus, setHylkaaAnomus] = useState<number>();

    useEffect(() => {
        const currentDates = { ...dates };
        setDates(
            props.anomukset.reduce(
                (acc, kayttooikeus) => ({
                    ...acc,
                    [String(kayttooikeus.id)]: dates[String(kayttooikeus.id)] ?? {
                        alkupvm: moment(),
                        loppupvm: moment().add(1, 'years'),
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

    async function handleAnomus(
        id: number,
        kayttoOikeudenTila: KayttooikeudenTila,
        henkilo: HenkilonNimi,
        hylkaysperuste?: string
    ) {
        const date = dates[id];
        const alkupvm = date?.alkupvm?.format(PropertySingleton.state.PVM_DBFORMAATTI);
        const loppupvm = date?.loppupvm?.format(PropertySingleton.state.PVM_DBFORMAATTI);
        await putHaettuKayttooikeusryhma({
            henkiloOid: henkilo.oid,
            body: { id, kayttoOikeudenTila, alkupvm, loppupvm, hylkaysperuste },
        })
            .unwrap()
            .then(() => props.updateSuccessHandler && props.updateSuccessHandler(id, henkilo, kayttoOikeudenTila))
            .catch(() => props.updateErrorHandler && props.updateErrorHandler(id, henkilo, kayttoOikeudenTila));
        setHandledAnomusIds([...handledAnomusIds, id]);
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
                        disabled={
                            !!handledAnomusIds.find((id) => id === haettuKayttooikeusRyhma.id) ||
                            !dates?.[haettuKayttooikeusRyhma.id]?.loppupvm
                        }
                    />
                </div>
                <div style={{ display: 'table-cell' }}>
                    <button
                        className="oph-button oph-button-cancel oph-button-small"
                        disabled={!!handledAnomusIds.find((id) => id === haettuKayttooikeusRyhma.id)}
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

    const getHandledClassName = (h: HaettuKayttooikeusryhma) => {
        return handledAnomusIds.find((id) => id === h.id) ? 'handled' : undefined;
    };

    const columns = useMemo<ColumnDef<HaettuKayttooikeusryhma, HaettuKayttooikeusryhma>[]>(
        () => [
            expanderColumn,
            {
                id: 'ANOTTU_PVM',
                header: () => L['ANOTTU_PVM'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => (
                    <span className={getHandledClassName(getValue())}>
                        {moment(getValue().anomus.anottuPvm).format()}
                    </span>
                ),
                sortingFn: (a, b) =>
                    moment(a.original.anomus.anottuPvm).isBefore(moment(b.original.anomus.anottuPvm)) ? -1 : 1,
            },
            {
                id: 'HENKILO_KAYTTOOIKEUS_NIMI',
                header: () => L['HENKILO_KAYTTOOIKEUS_NIMI'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => (
                    <span className={getHandledClassName(getValue())}>
                        {getValue().anomus.henkilo.etunimet + ' ' + getValue().anomus.henkilo.sukunimi}
                    </span>
                ),
                enableSorting: false,
            },
            {
                id: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO',
                header: () => L['HENKILO_KAYTTOOIKEUS_ORGANISAATIO'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => (
                    <span className={getHandledClassName(getValue())}>
                        {isSuccess
                            ? StaticUtils.getOrganisationNameWithType(
                                  organisations.find((o) => o.oid === getValue().anomus.organisaatioOid),
                                  L,
                                  locale
                              )
                            : '...'}
                    </span>
                ),
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
                            )[0].text
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
                key: 'HENKILO_KAYTTOOIKEUSANOMUS_PERUSTELU',
                accessorFn: (row) => row,
                cell: ({ getValue }) => createSelitePopupButton(getValue().anomus.perustelut),
                enableSorting: false,
            },
            {
                id: 'HENKILO_KAYTTOOIKEUS_ALKUPVM',
                header: () => L['HENKILO_KAYTTOOIKEUS_ALKUPVM'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => (
                    <span className={getHandledClassName(getValue())}>
                        {dates[getValue().id]?.alkupvm.format() ?? ''}
                    </span>
                ),
                enableSorting: false,
            },
            {
                id: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM',
                header: () => L['HENKILO_KAYTTOOIKEUS_LOPPUPVM'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => dates[getValue().id]?.loppupvm?.format() ?? '',
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
                                    loppupvm: value ? moment(value) : undefined,
                                },
                            })
                        }
                        selected={dates[getValue().id]?.loppupvm?.toDate()}
                        showYearDropdown
                        showWeekNumbers
                        disabled={!!handledAnomusIds.find((i) => i === getValue().id)}
                        filterDate={(date) => moment(date).isBefore(moment().add(1, 'years'))}
                        dateFormat={PropertySingleton.getState().PVM_DATEPICKER_FORMAATTI}
                    />
                ),
            },
            {
                id: 'HENKILO_KAYTTOOIKEUSANOMUS_TYYPPI',
                header: () => L['HENKILO_KAYTTOOIKEUSANOMUS_TYYPPI'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => (
                    <span className={getHandledClassName(getValue())}>{L[getValue().anomus.anomusTyyppi]}</span>
                ),
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
        columns: columns ?? emptyArray,
        pageCount: 1,
        data: memoizedData ?? emptyArray,
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
