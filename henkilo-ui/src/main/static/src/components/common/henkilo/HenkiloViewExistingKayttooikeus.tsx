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
    addKayttooikeusToHenkilo,
    createKayttooikeusanomus,
    fetchAllKayttooikeusAnomusForHenkilo,
    removePrivilege,
} from '../../../actions/kayttooikeusryhma.actions';
import { HenkiloState } from '../../../reducers/henkilo.reducer';
import { KayttooikeusRyhmaState } from '../../../reducers/kayttooikeusryhma.reducer';
import { removeNotification } from '../../../actions/notifications.actions';
import { createEmailOptions } from '../../../utilities/henkilo.util';
import { MyonnettyKayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { KAYTTOOIKEUDENTILA } from '../../../globals/KayttooikeudenTila';
import { OrganisaatioCache } from '../../../reducers/organisaatio.reducer';
import AccessRightDetails, { AccessRight, AccessRightDetaisLink } from './AccessRightDetails';
import { localizeTextGroup } from '../../../utilities/localisation.util';
import { NotificationsState } from '../../../reducers/notifications.reducer';
import { useLocalisations } from '../../../selectors';
import OphTable from '../../OphTable';
import { useGetOmattiedotQuery } from '../../../api/kayttooikeus';
import ConfirmButton from '../button/ConfirmButton';
import Loader from '../icons/Loader';

type OwnProps = {
    oidHenkilo: string;
    isOmattiedot: boolean;
    vuosia: number;
    existingKayttooikeusRef: MutableRefObject<HTMLDivElement>;
};

const HenkiloViewExistingKayttooikeus = (props: OwnProps) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const { L, locale } = useLocalisations();
    const dispatch = useAppDispatch();
    const kayttooikeus = useSelector<RootState, KayttooikeusRyhmaState>((state) => state.kayttooikeus);
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const notifications = useSelector<RootState, NotificationsState>((state) => state.notifications);
    const organisaatioCache = useSelector<RootState, OrganisaatioCache>((state) => state.organisaatio.cached);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const [dates, setDates] = useState<Record<number, { alkupvm: Moment; loppupvm: Moment }>>(
        kayttooikeus.kayttooikeus.filter(_filterExpiredKayttooikeus).reduce(
            (acc, kayttooikeus) => ({
                ...acc,
                [kayttooikeus.ryhmaId]: {
                    alkupvm: moment(),
                    loppupvm: props.vuosia
                        ? moment().add(props.vuosia, 'years')
                        : moment(kayttooikeus.voimassaPvm, PropertySingleton.state.PVM_DBFORMAATTI).add(1, 'years'),
                },
            }),
            {}
        )
    );
    const [emailOptions, setEmailOptions] = useState(
        createEmailOptions(henkilo, _filterExpiredKayttooikeus, kayttooikeus.kayttooikeus)
    );
    const [accessRight, setAccessRight] = useState<AccessRight>();

    useEffect(() => {
        setEmailOptions(createEmailOptions(henkilo, _filterExpiredKayttooikeus, kayttooikeus.kayttooikeus));
    }, [henkilo]);

    function loppupvmAction(value: moment.Moment, ryhmaId: number) {
        const newDates = { ...dates };
        newDates[ryhmaId].loppupvm = value;
        setDates(newDates);
    }

    function updateKayttooikeusryhma(id: number, kayttoOikeudenTila: string, organisaatioOid: string) {
        dispatch<any>(
            addKayttooikeusToHenkilo(props.oidHenkilo, organisaatioOid, [
                {
                    id,
                    kayttoOikeudenTila,
                    alkupvm: moment(dates[id].alkupvm).format(PropertySingleton.state.PVM_DBFORMAATTI),
                    loppupvm: moment(dates[id].loppupvm).format(PropertySingleton.state.PVM_DBFORMAATTI),
                },
            ])
        );
    }

    function isHaeJatkoaikaaButtonDisabled(uusittavaKayttooikeusRyhma: MyonnettyKayttooikeusryhma) {
        const anomusAlreadyExists = !!kayttooikeus.kayttooikeusAnomus?.filter(
            (haettuKayttooikeusRyhma) =>
                haettuKayttooikeusRyhma.kayttoOikeusRyhma.id === uusittavaKayttooikeusRyhma.ryhmaId &&
                uusittavaKayttooikeusRyhma.organisaatioOid === haettuKayttooikeusRyhma.anomus.organisaatioOid
        )[0];
        return (
            emailOptions.emailSelection[uusittavaKayttooikeusRyhma.ryhmaId].value === '' ||
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
                          checked={emailOptions.emailSelection[ryhmaId].value === email.value}
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
            email: emailOptions.emailSelection[uusittavaKayttooikeusRyhma.ryhmaId].value,
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
                            updateKayttooikeusryhma(
                                kayttooikeus.ryhmaId,
                                KAYTTOOIKEUDENTILA.MYONNETTY,
                                kayttooikeus.organisaatioOid
                            )
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
                    StaticUtils.getOrganisationNameWithType(organisaatioCache[getValue().organisaatioOid], L, locale),
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
                            dispatch<any>(
                                removePrivilege(props.oidHenkilo, getValue().organisaatioOid, getValue().ryhmaId)
                            )
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
        [emailOptions, kayttooikeus.kayttooikeus, props, organisaatioCache]
    );

    const table = useReactTable({
        columns,
        pageCount: 1,
        data: kayttooikeus.kayttooikeus.filter(_filterExpiredKayttooikeus),
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

    return kayttooikeus.kayttooikeusLoading ? (
        <Loader />
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
