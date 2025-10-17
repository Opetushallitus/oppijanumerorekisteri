import React, { MutableRefObject, useEffect, useId, useMemo, useState } from 'react';
import moment, { Moment } from 'moment';
import DatePicker from 'react-datepicker';
import { useReactTable, getCoreRowModel, getSortedRowModel, ColumnDef, SortingState } from '@tanstack/react-table';

import { useAppDispatch } from '../../../store';
import SuljeButton from './buttons/SuljeButton';
import StaticUtils from '../StaticUtils';
import HaeJatkoaikaaButton from '../../omattiedot/HaeJatkoaikaaButton';
import PropertySingleton from '../../../globals/PropertySingleton';
import { createEmailOptions } from '../../../utilities/henkilo.util';
import { MyonnettyKayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { KAYTTOOIKEUDENTILA } from '../../../globals/KayttooikeudenTila';
import AccessRightDetails, { AccessRight, AccessRightDetaisLink } from './AccessRightDetails';
import { localizeTextGroup } from '../../../utilities/localisation.util';
import { useKayttooikeusryhmas, useLocalisations } from '../../../selectors';
import OphTable from '../../OphTable';
import {
    useDeleteKayttooikeusryhmaForHenkiloMutation,
    useGetKayttooikeusAnomuksetForHenkiloQuery,
    useGetOrganisationsQuery,
    usePostKayttooikeusAnomusMutation,
    usePutKayttooikeusryhmaForHenkiloMutation,
} from '../../../api/kayttooikeus';
import ConfirmButton from '../button/ConfirmButton';
import Loader from '../icons/Loader';
import { OphDsBanner } from '../../design-system/OphDsBanner';
import { add } from '../../../slices/toastSlice';
import { useGetHenkiloQuery } from '../../../api/oppijanumerorekisteri';

type OwnProps = {
    oidHenkilo: string;
    isOmattiedot: boolean;
    isPalvelukayttaja: boolean;
    existingKayttooikeusRef: MutableRefObject<HTMLDivElement | null>;
};

const emptyData: MyonnettyKayttooikeusryhma[] = [];
const emptyColumns: ColumnDef<MyonnettyKayttooikeusryhma, MyonnettyKayttooikeusryhma>[] = [];

const HenkiloViewExistingKayttooikeus = (props: OwnProps) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const { L, locale } = useLocalisations();
    const {
        data: kayttooikeusryhmas,
        isLoading,
        isError,
    } = useKayttooikeusryhmas(props.isOmattiedot, props.oidHenkilo);
    const [putKayttooikeusryhma] = usePutKayttooikeusryhmaForHenkiloMutation();
    const [deleteKayttooikeusryhma] = useDeleteKayttooikeusryhmaForHenkiloMutation();
    const [postKayttooikeusAnomus] = usePostKayttooikeusAnomusMutation();
    const dispatch = useAppDispatch();
    const { data: henkilo } = useGetHenkiloQuery(props.oidHenkilo);
    const { data: organisations, isSuccess } = useGetOrganisationsQuery();
    const { data: anomukset } = useGetKayttooikeusAnomuksetForHenkiloQuery(props.oidHenkilo);
    const [dates, setDates] = useState<Record<number, { alkupvm: Moment; loppupvm: Moment }>>([]);
    const [emailOptions, setEmailOptions] = useState(
        createEmailOptions(_filterExpiredKayttooikeus, kayttooikeusryhmas ?? [], henkilo)
    );
    const [accessRight, setAccessRight] = useState<AccessRight>();

    useEffect(() => {
        if (kayttooikeusryhmas?.length) {
            setDates(
                kayttooikeusryhmas.filter(_filterExpiredKayttooikeus).reduce(
                    (acc, kayttooikeus) => ({
                        ...acc,
                        [kayttooikeus.ryhmaId]: {
                            alkupvm: moment(),
                            loppupvm: props.isPalvelukayttaja
                                ? moment(kayttooikeus.voimassaPvm, PropertySingleton.state.PVM_DBFORMAATTI).add(
                                      1,
                                      'years'
                                  )
                                : moment().add(1, 'years'),
                        },
                    }),
                    {}
                )
            );
            setEmailOptions(createEmailOptions(_filterExpiredKayttooikeus, kayttooikeusryhmas ?? [], henkilo));
        }
    }, [henkilo, kayttooikeusryhmas]);

    function loppupvmAction(value: moment.Moment, ryhmaId: number) {
        const newDates = { ...dates };
        if (newDates[ryhmaId]) {
            newDates[ryhmaId].loppupvm = value;
        }
        setDates(newDates);
    }

    function isHaeJatkoaikaaButtonDisabled(uusittavaKayttooikeusRyhma: MyonnettyKayttooikeusryhma) {
        const anomusAlreadyExists = !!(anomukset ?? []).filter(
            (haettuKayttooikeusRyhma) =>
                haettuKayttooikeusRyhma.kayttoOikeusRyhma.id === uusittavaKayttooikeusRyhma.ryhmaId &&
                uusittavaKayttooikeusRyhma.organisaatioOid === haettuKayttooikeusRyhma.anomus.organisaatioOid
        )[0];
        return (
            emailOptions.emailSelection[uusittavaKayttooikeusRyhma.ryhmaId]?.value === '' ||
            emailOptions.emailOptions.length === 0 ||
            anomusAlreadyExists
        );
    }

    function createEmailSelectionIfMoreThanOne(ryhmaId: number): React.ReactNode {
        return emailOptions.emailOptions.length > 1
            ? emailOptions.emailOptions.map((email, idx2) => (
                  <div key={idx2}>
                      <input
                          type="radio"
                          checked={emailOptions.emailSelection[ryhmaId]?.value === email.value}
                          onChange={() =>
                              setEmailOptions({
                                  ...emailOptions,
                                  emailSelection: { ...emailOptions.emailSelection, [ryhmaId]: email },
                              })
                          }
                      />
                      <span>{email.value}</span>
                  </div>
              ))
            : null;
    }

    function showAccessRightGroupDetails(kayttooikeusRyhma: MyonnettyKayttooikeusryhma) {
        const accessRight = {
            name: localizeTextGroup(kayttooikeusRyhma.ryhmaNames?.texts, locale),
            description: localizeTextGroup(
                [...(kayttooikeusRyhma.ryhmaKuvaus?.texts || []), ...(kayttooikeusRyhma.ryhmaNames?.texts || [])],
                locale
            ),
            onClose: () => setAccessRight(undefined),
        };
        setAccessRight(accessRight);
    }

    async function _createKayttooikeusAnomus(uusittavaKayttooikeusRyhma: MyonnettyKayttooikeusryhma) {
        const kayttooikeusRyhmaIds = [uusittavaKayttooikeusRyhma.ryhmaId];
        const email = emailOptions.emailSelection[uusittavaKayttooikeusRyhma.ryhmaId]?.value;
        if (!email) {
            return;
        }
        const anomusData = {
            organisaatioOrRyhmaOid: uusittavaKayttooikeusRyhma.organisaatioOid,
            email,
            perustelut: 'Uusiminen',
            kayttooikeusRyhmaIds,
            anojaOid: props.oidHenkilo,
        };
        postKayttooikeusAnomus(anomusData)
            .unwrap()
            .then(() => {
                dispatch(
                    add({
                        id: `anomus-ok-${Math.random()}`,
                        type: 'ok',
                        header: L['OMATTIEDOT_ANOMUKSEN_TALLENNUS_OK'],
                    })
                );
            })
            .catch(() => {
                dispatch(
                    add({
                        id: `anomus-error-${Math.random()}`,
                        type: 'error',
                        header: L['OMATTIEDOT_ANOMUKSEN_TALLENNUS_VIRHEILMOITUS'],
                    })
                );
            });
    }

    function _filterExpiredKayttooikeus(kayttooikeus: MyonnettyKayttooikeusryhma) {
        return (
            kayttooikeus.tila !== KAYTTOOIKEUDENTILA.SULJETTU && kayttooikeus.tila !== KAYTTOOIKEUDENTILA.VANHENTUNUT
        );
    }

    const renderJatkoaikaCell = (kayttooikeus: MyonnettyKayttooikeusryhma) => {
        return (
            <div>
                <div style={{ display: 'table-cell', paddingRight: '10px', minWidth: '96px' }}>
                    <DatePicker
                        className="oph-input"
                        onChange={(date) => date && loppupvmAction(moment(date), kayttooikeus.ryhmaId)}
                        selected={dates[kayttooikeus.ryhmaId]?.loppupvm.toDate()}
                        showYearDropdown
                        showWeekNumbers
                        filterDate={(date) =>
                            props.isPalvelukayttaja ? true : moment(date).isBefore(moment().add(1, 'years'))
                        }
                        dateFormat={PropertySingleton.getState().PVM_DATEPICKER_FORMAATTI}
                    />
                </div>
                <div style={{ display: 'table-cell' }}>
                    <ConfirmButton
                        action={() =>
                            putKayttooikeusryhma({
                                henkiloOid: props.oidHenkilo,
                                organisationOid: kayttooikeus.organisaatioOid,
                                body: [
                                    {
                                        id: kayttooikeus.ryhmaId,
                                        kayttoOikeudenTila: KAYTTOOIKEUDENTILA.MYONNETTY,
                                        alkupvm: moment(dates[kayttooikeus.ryhmaId]?.alkupvm).format(
                                            PropertySingleton.state.PVM_DBFORMAATTI
                                        ),
                                        loppupvm: moment(dates[kayttooikeus.ryhmaId]?.loppupvm).format(
                                            PropertySingleton.state.PVM_DBFORMAATTI
                                        ),
                                    },
                                ],
                            })
                                .unwrap()
                                .then(() => {
                                    dispatch(
                                        add({
                                            id: `jatkoaika-ok-${Math.random()}`,
                                            type: 'ok',
                                            header: L['NOTIFICATION_LISAA_KAYTTOOIKEUS_ONNISTUI'],
                                        })
                                    );
                                })
                                .catch(() => {
                                    dispatch(
                                        add({
                                            id: `jatkoaika-error-${Math.random()}`,
                                            type: 'error',
                                            header: L['NOTIFICATION_LISAA_KAYTTOOIKEUS_EPAONNISTUI'],
                                        })
                                    );
                                })
                        }
                        normalLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_MYONNA']}
                        confirmLabel={L['HENKILO_KAYTTOOIKEUSANOMUS_MYONNA_CONFIRM']}
                    />
                </div>
            </div>
        );
    };

    const columns = useMemo<ColumnDef<MyonnettyKayttooikeusryhma, MyonnettyKayttooikeusryhma>[]>(
        () => [
            {
                id: 'organisaatio',
                header: () => L['HENKILO_KAYTTOOIKEUS_ORGANISAATIO_TEHTAVA'],
                accessorFn: (row) => row,
                cell: ({ getValue }) =>
                    isSuccess
                        ? StaticUtils.getOrganisationNameWithType(
                              organisations?.find((o) => o.oid === getValue().organisaatioOid),
                              L,
                              locale
                          )
                        : '...',
            },
            {
                id: 'kayttooikeus',
                header: () => L['HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => (
                    <AccessRightDetaisLink<MyonnettyKayttooikeusryhma>
                        nimi={
                            getValue().ryhmaNames?.texts.filter((text) => text.lang === locale.toUpperCase())[0]
                                ?.text ?? ''
                        }
                        kayttooikeusRyhma={getValue()}
                        clickHandler={(kayttooikeusRyhma) => showAccessRightGroupDetails(kayttooikeusRyhma)}
                    />
                ),
            },
            {
                id: 'alkupvm',
                header: () => L['HENKILO_KAYTTOOIKEUS_ALKUPVM'],
                accessorFn: (row) => moment(row.alkuPvm, PropertySingleton.state.PVM_DBFORMAATTI).format(),
            },
            {
                id: 'loppupvm',
                header: () => L['HENKILO_KAYTTOOIKEUS_LOPPUPVM'],
                accessorFn: (row) => moment(row.voimassaPvm, PropertySingleton.state.PVM_DBFORMAATTI).format(),
            },
            {
                id: 'kasittelija',
                header: () => L['HENKILO_KAYTTOOIKEUS_KASITTELIJA'],
                accessorFn: (row) =>
                    moment(row.kasitelty, PropertySingleton.state.PVM_DBFORMAATTI).format() +
                    ' / ' +
                    (row.kasittelijaNimi || row.kasittelijaOid),
            },
            {
                id: 'jatkoaika',
                header: () => L['HENKILO_KAYTTOOIKEUS_JATKOAIKA'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => renderJatkoaikaCell(getValue()),
                enableSorting: false,
            },
            {
                id: 'sulje',
                header: () => L['HENKILO_KAYTTOOIKEUS_SULJE'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => (
                    <SuljeButton
                        suljeAction={() =>
                            deleteKayttooikeusryhma({
                                henkiloOid: props.oidHenkilo,
                                organisationOid: getValue().organisaatioOid,
                                kayttooikeusryhmaId: getValue().ryhmaId,
                            })
                        }
                        disabled={false}
                        L={L}
                    />
                ),
                enableSorting: false,
            },
            {
                id: 'haeJatkoaikaa',
                header: () => L['OMATTIEDOT_HAE_JATKOAIKAA'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => (
                    <div>
                        {createEmailSelectionIfMoreThanOne(getValue().ryhmaId)}
                        <HaeJatkoaikaaButton
                            haeJatkoaikaaAction={() => _createKayttooikeusAnomus(getValue())}
                            disabled={isHaeJatkoaikaaButtonDisabled(getValue())}
                        />
                    </div>
                ),
                enableSorting: false,
            },
        ],
        [emailOptions, kayttooikeusryhmas, props, organisations, isSuccess]
    );

    const memoizedData = useMemo(() => {
        const renderedData = (kayttooikeusryhmas ?? []).filter(_filterExpiredKayttooikeus);
        if (!renderedData || !renderedData.length) {
            return undefined;
        }
        return renderedData;
    }, [kayttooikeusryhmas]);

    const table = useReactTable({
        columns: columns ?? emptyColumns,
        pageCount: 1,
        data: memoizedData ?? emptyData,
        state: {
            sorting,
            columnVisibility: {
                haeJatkoaikaa: props.isOmattiedot,
                jatkoaika: !props.isOmattiedot,
                sulje: !props.isOmattiedot,
            },
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const sectionLabelId = useId();
    return isLoading ? (
        <Loader />
    ) : isError ? (
        <section aria-labelledby={sectionLabelId} className="henkiloViewUserContentWrapper">
            <h2 id={sectionLabelId}>{L['HENKILO_OLEVAT_KAYTTOOIKEUDET_OTSIKKO']}</h2>
            <OphDsBanner type="error">
                <p>{L['KAYTTOOIKEUSRYHMAT_ODOTTAMATON_VIRHE']}</p>
            </OphDsBanner>
        </section>
    ) : (
        <section
            aria-labelledby={sectionLabelId}
            ref={props.existingKayttooikeusRef}
            className="henkiloViewUserContentWrapper"
        >
            {accessRight && <AccessRightDetails {...accessRight} />}
            <h2 id={sectionLabelId}>{L['HENKILO_OLEVAT_KAYTTOOIKEUDET_OTSIKKO']}</h2>
            <OphTable table={table} isLoading={false} />
        </section>
    );
};

export default HenkiloViewExistingKayttooikeus;
