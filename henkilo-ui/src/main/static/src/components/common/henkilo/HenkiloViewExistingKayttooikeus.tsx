import React, { MutableRefObject, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import moment, { Moment } from 'moment';
import DatePicker from 'react-datepicker';
import { useReactTable, getCoreRowModel, getSortedRowModel, ColumnDef, SortingState } from '@tanstack/react-table';

import { useAppDispatch, type RootState } from '../../../store';
import Notifications from '../notifications/Notifications';
import SuljeButton from './buttons/SuljeButton';
import StaticUtils from '../StaticUtils';
import HaeJatkoaikaaButton from '../../omattiedot/HaeJatkoaikaaButton';
import PropertySingleton from '../../../globals/PropertySingleton';
import {
    createKayttooikeusanomus,
    fetchAllKayttooikeusAnomusForHenkilo,
} from '../../../actions/kayttooikeusryhma.actions';
import { HenkiloState } from '../../../reducers/henkilo.reducer';
import { removeNotification } from '../../../actions/notifications.actions';
import { createEmailOptions } from '../../../utilities/henkilo.util';
import { MyonnettyKayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { KAYTTOOIKEUDENTILA } from '../../../globals/KayttooikeudenTila';
import AccessRightDetails, { AccessRight, AccessRightDetaisLink } from './AccessRightDetails';
import { localizeTextGroup } from '../../../utilities/localisation.util';
import { NotificationsState } from '../../../reducers/notifications.reducer';
import { useKayttooikeusryhmas, useLocalisations } from '../../../selectors';
import OphTable from '../../OphTable';
import {
    useDeleteKayttooikeusryhmaForHenkiloMutation,
    useGetOmattiedotQuery,
    useGetOrganisationsQuery,
    usePutKayttooikeusryhmaForHenkiloMutation,
} from '../../../api/kayttooikeus';
import ConfirmButton from '../button/ConfirmButton';
import Loader from '../icons/Loader';
import { OphDsBanner } from '../../design-system/OphDsBanner';
import { KayttooikeusRyhmaState } from '../../../reducers/kayttooikeusryhma.reducer';
import { add } from '../../../slices/toastSlice';

type OwnProps = {
    oidHenkilo: string;
    isOmattiedot: boolean;
    vuosia: number;
    existingKayttooikeusRef: MutableRefObject<HTMLDivElement>;
};

const emptyArray = [];

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
    const dispatch = useAppDispatch();
    const kayttooikeus = useSelector<RootState, KayttooikeusRyhmaState>((state) => state.kayttooikeus);
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const notifications = useSelector<RootState, NotificationsState>((state) => state.notifications);
    const { data: organisations, isSuccess } = useGetOrganisationsQuery();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const [dates, setDates] = useState<Record<number, { alkupvm: Moment; loppupvm: Moment }>>([]);
    const [emailOptions, setEmailOptions] = useState(
        createEmailOptions(henkilo, _filterExpiredKayttooikeus, kayttooikeusryhmas ?? [])
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
                            loppupvm: props.vuosia
                                ? moment().add(props.vuosia, 'years')
                                : moment(kayttooikeus.voimassaPvm, PropertySingleton.state.PVM_DBFORMAATTI).add(
                                      1,
                                      'years'
                                  ),
                        },
                    }),
                    {}
                )
            );
            setEmailOptions(createEmailOptions(henkilo, _filterExpiredKayttooikeus, kayttooikeusryhmas ?? []));
        }
    }, [henkilo, kayttooikeusryhmas]);

    function loppupvmAction(value: moment.Moment, ryhmaId: number) {
        const newDates = { ...dates };
        newDates[ryhmaId].loppupvm = value;
        setDates(newDates);
    }

    function isHaeJatkoaikaaButtonDisabled(uusittavaKayttooikeusRyhma: MyonnettyKayttooikeusryhma) {
        const anomusAlreadyExists = !!kayttooikeus.kayttooikeusAnomus?.filter(
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

    function showAccessRightGroupDetails(kayttooikeusRyhma) {
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
        const anomusData = {
            organisaatioOrRyhmaOid: uusittavaKayttooikeusRyhma.organisaatioOid,
            email: emailOptions.emailSelection[uusittavaKayttooikeusRyhma.ryhmaId]?.value,
            perustelut: 'Uusiminen',
            kayttooikeusRyhmaIds,
            anojaOid: props.oidHenkilo,
        };
        await dispatch<any>(createKayttooikeusanomus(anomusData));
        dispatch<any>(fetchAllKayttooikeusAnomusForHenkilo(omattiedot.oidHenkilo));
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
                        onChange={(date) => loppupvmAction(moment(date), kayttooikeus.ryhmaId)}
                        selected={dates[kayttooikeus.ryhmaId]?.loppupvm.toDate()}
                        showYearDropdown
                        showWeekNumbers
                        filterDate={(date) =>
                            Number.isInteger(props.vuosia)
                                ? moment(date).isBefore(moment().add(props.vuosia, 'years'))
                                : true
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
                                        alkupvm: moment(dates[kayttooikeus.ryhmaId].alkupvm).format(
                                            PropertySingleton.state.PVM_DBFORMAATTI
                                        ),
                                        loppupvm: moment(dates[kayttooikeus.ryhmaId].loppupvm).format(
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
                        id={`myonna-${kayttooikeus.ryhmaId}`}
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
                        nimi={getValue().ryhmaNames?.texts.filter((text) => text.lang === locale.toUpperCase())[0].text}
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
        columns: columns ?? emptyArray,
        pageCount: 1,
        data: memoizedData ?? emptyArray,
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

    return isLoading ? (
        <Loader />
    ) : isError ? (
        <div className="henkiloViewUserContentWrapper">
            <h2>{L['HENKILO_OLEVAT_KAYTTOOIKEUDET_OTSIKKO']}</h2>
            <OphDsBanner type="error">
                <p>{L['KAYTTOOIKEUSRYHMAT_ODOTTAMATON_VIRHE']}</p>
            </OphDsBanner>
        </div>
    ) : (
        <div ref={props.existingKayttooikeusRef} className="henkiloViewUserContentWrapper">
            {accessRight && <AccessRightDetails {...accessRight} />}
            <h2>{L['HENKILO_OLEVAT_KAYTTOOIKEUDET_OTSIKKO']}</h2>
            <Notifications
                notifications={notifications.existingKayttooikeus}
                L={L}
                closeAction={(status, id) => dispatch(removeNotification(status, 'existingKayttooikeus', id))}
            />
            <OphTable table={table} isLoading={false} />
        </div>
    );
};

export default HenkiloViewExistingKayttooikeus;
