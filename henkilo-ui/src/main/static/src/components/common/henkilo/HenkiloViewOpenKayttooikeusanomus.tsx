import React, { useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import type { Moment } from 'moment';
import DatePicker from 'react-datepicker';
import { urls } from 'oph-urls-js';
import { useReactTable, getCoreRowModel, getSortedRowModel, ColumnDef, Row, SortingState } from '@tanstack/react-table';

import StaticUtils from '../StaticUtils';
import Button from '../button/Button';
import { http } from '../../../http';
import PopupButton from '../button/PopupButton';
import AnomusHylkaysPopup from '../../anomus/AnomusHylkaysPopup';
import PropertySingleton from '../../../globals/PropertySingleton';
import { AnojaKayttooikeusryhmat } from '../../anomus/AnojaKayttooikeusryhmat';
import {
    Kayttooikeusryhma,
    MyonnettyKayttooikeusryhma,
} from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { localize, localizeTextGroup } from '../../../utilities/localisation.util';
import './HenkiloViewOpenKayttooikeusanomus.css';
import { KAYTTOOIKEUDENTILA, KayttooikeudenTila } from '../../../globals/KayttooikeudenTila';
import { KayttooikeusRyhmaState } from '../../../reducers/kayttooikeusryhma.reducer';
import AccessRightDetails, { AccessRight, AccessRightDetaisLink } from './AccessRightDetails';
import { HenkilonNimi } from '../../../types/domain/kayttooikeus/HenkilonNimi';
import { useAppDispatch } from '../../../store';
import {
    fetchAllKayttooikeusAnomusForHenkilo,
    updateHaettuKayttooikeusryhma,
} from '../../../actions/kayttooikeusryhma.actions';
import { useLocalisations } from '../../../selectors';
import { HaettuKayttooikeusryhma } from '../../../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types';
import { OphTableWithInfiniteScroll } from '../../OphTableWithInfiniteScroll';
import OphTable, { expanderColumn } from '../../OphTable';
import { useGetOmattiedotQuery, useGetOrganisationsQuery } from '../../../api/kayttooikeus';
import OphModal from '../modal/OphModal';
import ConfirmButton from '../button/ConfirmButton';

export type KayttooikeusryhmaData = {
    voimassaPvm: string;
    organisaatioNimi: string;
    kayttooikeusryhmaNimi: string;
};

export type AnojaKayttooikeusryhmaData = {
    anojaOid: string;
    kayttooikeudet: Array<KayttooikeusryhmaData>;
    error: boolean;
};

type OwnProps = {
    isOmattiedot: boolean;
    fetchMoreSettings?: {
        fetchMoreAction: () => void;
        isActive: boolean;
    };
    onSortingChange?: (sorting: SortingState) => void;
    tableLoading?: boolean;
    piilotaOtsikko?: boolean;
    kayttooikeus: KayttooikeusRyhmaState;
    updateHaettuKayttooikeusryhmaAlt?: (
        arg0: number,
        arg1: KayttooikeudenTila,
        arg2: string,
        arg3: string | undefined,
        arg4: HenkilonNimi,
        arg5?: string
    ) => void;
};

const emptyArray = [];

const HenkiloViewOpenKayttooikeusanomus = (props: OwnProps) => {
    const [sorting, setSorting] = useState<SortingState>([{ id: 'ANOTTU_PVM', desc: true }]);
    const dispatch = useAppDispatch();
    const { L, locale, l10n } = useLocalisations();
    const { data: organisations, isSuccess } = useGetOrganisationsQuery();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const [dates, setDates] = useState<{ [anomusId: number]: { alkupvm: Moment; loppupvm?: Moment } }>(
        props.kayttooikeus?.kayttooikeusAnomus?.reduce(
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
    const [kayttooikeusRyhmatByAnoja, setKayttooikeusRyhmatByAnoja] = useState<AnojaKayttooikeusryhmaData[]>([]);
    const [handledAnomusIds, setHandledAnomusIds] = useState<number[]>([]);
    const [accessRight, setAccessRight] = useState<AccessRight>();
    const [hylkaaAnomus, setHylkaaAnomus] = useState<number>();

    useEffect(() => {
        const currentDates = { ...dates };
        setDates(
            props.kayttooikeus?.kayttooikeusAnomus?.reduce(
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
    }, [props.kayttooikeus?.kayttooikeusAnomus]);

    useEffect(() => (props.onSortingChange && sorting.length ? props.onSortingChange(sorting) : undefined), [sorting]);

    function createSelitePopupButton(perustelut: string) {
        return (
            <PopupButton
                popupClass={'oph-popup-default oph-popup-bottom'}
                popupButtonWrapperPositioning={'absolute'}
                popupArrowStyles={{ marginLeft: '10px' }}
                popupButtonClasses={'oph-button oph-button-ghost anomuslistaus-avaabutton'}
                popupStyle={{
                    left: '-20px',
                    width: '20rem',
                    padding: '30px',
                    position: 'absolute',
                }}
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

    function handleAnomus(id: number, tila: KayttooikeudenTila, henkilo: HenkilonNimi, hylkaysperuste?: string) {
        const date = dates[id];
        const alkupvm = date?.alkupvm?.format(PropertySingleton.state.PVM_DBFORMAATTI);
        const loppupvm = date?.loppupvm?.format(PropertySingleton.state.PVM_DBFORMAATTI);
        if (props.updateHaettuKayttooikeusryhmaAlt) {
            props.updateHaettuKayttooikeusryhmaAlt(id, tila, alkupvm, loppupvm, henkilo, hylkaysperuste);
        } else {
            dispatch<any>(updateHaettuKayttooikeusryhma(id, tila, alkupvm, loppupvm, henkilo, hylkaysperuste));
        }
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
                        id={`myonna-${haettuKayttooikeusRyhma.id}`}
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
        const url = urls.url('kayttooikeus-service.omattiedot.anomus.muokkaus');
        await http.put(url, haettuKayttooikeusRyhma.id);
        if (omattiedot) {
            dispatch<any>(fetchAllKayttooikeusAnomusForHenkilo(omattiedot.oidHenkilo));
        }
    }

    function fetchKayttooikeusryhmatByAnoja({ row }: { row: Row<HaettuKayttooikeusryhma> }) {
        const anojaOid = props.kayttooikeus.kayttooikeusAnomus?.find((a) => a.id === row.original.id)?.anomus.henkilo
            .oid;
        if (anojaOid && !kayttooikeusRyhmatByAnoja.find((a) => a.anojaOid === anojaOid)) {
            _parseAnojaKayttooikeusryhmat(anojaOid);
        }

        return (
            <AnojaKayttooikeusryhmat data={kayttooikeusRyhmatByAnoja.find((ryhma) => ryhma.anojaOid === anojaOid)} />
        );
    }

    function _parseAnojaKayttooikeusryhmat(anojaOid: string): void {
        const url = urls.url('kayttooikeus-service.kayttooikeusryhma.henkilo.oid', anojaOid);
        http.get<MyonnettyKayttooikeusryhma[]>(url)
            .then((myonnettyKayttooikeusryhmat: MyonnettyKayttooikeusryhma[]) => {
                const kayttooikeudet: KayttooikeusryhmaData[] = myonnettyKayttooikeusryhmat
                    .filter(
                        (myonnettyKayttooikeusryhma) => myonnettyKayttooikeusryhma.tila !== KAYTTOOIKEUDENTILA.ANOTTU
                    )
                    .map(_parseAnojaKayttooikeus);
                const anojaKayttooikeusryhmat = {
                    anojaOid,
                    kayttooikeudet: kayttooikeudet,
                    error: false,
                };
                setKayttooikeusRyhmatByAnoja([...kayttooikeusRyhmatByAnoja, anojaKayttooikeusryhmat]);
            })
            .catch(() => {
                const anojaKayttooikeusryhmat = {
                    anojaOid,
                    kayttooikeudet: [],
                    error: true,
                };
                setKayttooikeusRyhmatByAnoja([...kayttooikeusRyhmatByAnoja, anojaKayttooikeusryhmat]);
                console.error(`Anojan ${anojaOid} käyttöoikeuksien hakeminen epäonnistui`);
            });
    }

    const _parseAnojaKayttooikeus = (myonnettyKayttooikeusryhma: MyonnettyKayttooikeusryhma): KayttooikeusryhmaData => {
        const kayttooikeusryhmaNimiTexts =
            myonnettyKayttooikeusryhma.ryhmaNames && myonnettyKayttooikeusryhma.ryhmaNames.texts;
        const kayttooikeusryhmaNimi = kayttooikeusryhmaNimiTexts
            ? localizeTextGroup(kayttooikeusryhmaNimiTexts, locale) || ''
            : '';
        const organisaatioNimi = _parseOrganisaatioNimi(myonnettyKayttooikeusryhma);
        return {
            voimassaPvm: _parseVoimassaPvm(myonnettyKayttooikeusryhma),
            organisaatioNimi: organisaatioNimi,
            kayttooikeusryhmaNimi: kayttooikeusryhmaNimi,
        };
    };

    const _parseOrganisaatioNimi = (myonnettyKayttooikeusryhma: MyonnettyKayttooikeusryhma): string => {
        const organisaatio =
            isSuccess && organisations.find((o) => o.oid === myonnettyKayttooikeusryhma.organisaatioOid);
        return organisaatio && organisaatio.nimi
            ? organisaatio.nimi[locale] ||
                  organisaatio.nimi['fi'] ||
                  organisaatio.nimi['en'] ||
                  organisaatio.nimi['sv'] ||
                  organisaatio.oid
            : localize('HENKILO_AVOIMET_KAYTTOOIKEUDET_ORGANISAATIOTA_EI_LOYDY', l10n.localisations, locale);
    };

    const _parseVoimassaPvm = (myonnettyKayttooikeusryhma: MyonnettyKayttooikeusryhma): string => {
        const noLoppupvm = localize('HENKILO_AVOIMET_KAYTTOOIKEUDET_EI_LOPPUPVM', l10n.localisations, locale);
        if (!myonnettyKayttooikeusryhma.voimassaPvm) {
            return noLoppupvm;
        } else if (myonnettyKayttooikeusryhma.tila !== KAYTTOOIKEUDENTILA.SULJETTU) {
            return myonnettyKayttooikeusryhma.voimassaPvm
                ? moment(new Date(myonnettyKayttooikeusryhma.voimassaPvm)).format()
                : noLoppupvm;
        }
        return new Date(myonnettyKayttooikeusryhma.kasitelty).toString();
    };

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
        [props.kayttooikeus?.kayttooikeusAnomus, dates, organisations, isSuccess]
    );

    const memoizedData = useMemo(() => {
        const renderedData = props.kayttooikeus?.kayttooikeusAnomus;
        if (!renderedData || !renderedData.length) {
            return undefined;
        }
        return renderedData;
    }, [props.kayttooikeus]);

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

    const hylattyKayttooikeusryhma =
        hylkaaAnomus && props.kayttooikeus?.kayttooikeusAnomus?.find((a) => a.id === hylkaaAnomus);
    return (
        <div className="henkiloViewUserContentWrapper">
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
                {!props.piilotaOtsikko && <h2>{L['HENKILO_AVOIMET_KAYTTOOIKEUDET_OTSIKKO']}</h2>}
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
        </div>
    );
};

export default HenkiloViewOpenKayttooikeusanomus;
