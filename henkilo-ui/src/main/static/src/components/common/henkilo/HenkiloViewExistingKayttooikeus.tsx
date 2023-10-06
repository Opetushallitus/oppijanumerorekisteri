import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { update } from 'ramda';

import { useAppDispatch, type RootState } from '../../../store';
import Table from '../table/Table';
import MyonnaButton from './buttons/MyonnaButton';
import Notifications from '../notifications/Notifications';
import SuljeButton from './buttons/SuljeButton';
import StaticUtils from '../StaticUtils';
import HaeJatkoaikaaButton from '../../omattiedot/HaeJatkoaikaaButton';
import PropertySingleton from '../../../globals/PropertySingleton';
import { toLocalizedText } from '../../../localizabletext';
import {
    addKayttooikeusToHenkilo,
    createKayttooikeusanomus,
    fetchAllKayttooikeusAnomusForHenkilo,
    removePrivilege,
} from '../../../actions/kayttooikeusryhma.actions';
import { TableCellProps } from '../../../types/react-table.types';
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
import { OmattiedotState } from '../../../reducers/omattiedot.reducer';

type OwnProps = {
    oidHenkilo: string;
    isOmattiedot: boolean;
    vuosia: number;
};

const HenkiloViewExistingKayttooikeus = (props: OwnProps) => {
    const { L, locale, l10n } = useLocalisations();
    const dispatch = useAppDispatch();
    const kayttooikeus = useSelector<RootState, KayttooikeusRyhmaState>((state) => state.kayttooikeus);
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const notifications = useSelector<RootState, NotificationsState>((state) => state.notifications);
    const organisaatioCache = useSelector<RootState, OrganisaatioCache>((state) => state.organisaatio.cached);
    const omattiedot = useSelector<RootState, OmattiedotState>((state) => state.omattiedot);
    const [dates, setDates] = useState(
        kayttooikeus.kayttooikeus.filter(_filterExpiredKayttooikeus).map((kayttooikeusAnomus) => ({
            alkupvm: moment(),
            loppupvm: props.vuosia
                ? moment().add(props.vuosia, 'years')
                : moment(kayttooikeusAnomus.voimassaPvm, PropertySingleton.state.PVM_DBFORMAATTI).add(1, 'years'),
        }))
    );
    const [emailOptions, setEmailOptions] = useState(
        createEmailOptions(henkilo, _filterExpiredKayttooikeus, kayttooikeus.kayttooikeus)
    );
    const [accessRight, setAccessRight] = useState<AccessRight>();

    useEffect(() => {
        setEmailOptions(createEmailOptions(henkilo, _filterExpiredKayttooikeus, kayttooikeus.kayttooikeus));
    }, [henkilo]);

    const headingList = [
        { key: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO_TEHTAVA', minWidth: 200 },
        {
            key: 'HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS',
            minWidth: 150,
            Cell: (cellProps: TableCellProps) => (
                <AccessRightDetaisLink
                    cellProps={cellProps}
                    clickHandler={(kayttooikeusRyhma) => showAccessRightGroupDetails(kayttooikeusRyhma)}
                />
            ),
        },
        {
            key: 'HENKILO_KAYTTOOIKEUS_ALKUPVM',
            Cell: (cellProps) => cellProps.value.format(),
        },
        {
            key: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM',
            Cell: (cellProps) => cellProps.value.format(),
        },
        {
            key: 'HENKILO_KAYTTOOIKEUS_KASITTELIJA',
            minWidth: 125,
            Cell: (cellProps) => cellProps.value.kasitelty.format() + ' / ' + cellProps.value.kasittelija,
            sortMethod: (a, b) => {
                const kasiteltyCompare = a.kasitelty.valueOf() - b.kasitelty.valueOf();
                if (kasiteltyCompare !== 0) {
                    return kasiteltyCompare;
                }
                return a.kasittelija.localeCompare(b.kasittelija);
            },
        },
        {
            key: 'HENKILO_KAYTTOOIKEUS_JATKOAIKA',
            minWidth: 150,
            notSortable: true,
            hide: props.isOmattiedot,
        },
        {
            key: 'HENKILO_KAYTTOOIKEUS_SULJE',
            notSortable: true,
            hide: props.isOmattiedot,
        },
        { key: 'HIGHLIGHT', hide: true },
        {
            key: 'HENKILO_KAYTTOOIKEUS_ANO_JATKOAIKA',
            notSortable: true,
            hide: !props.isOmattiedot,
        },
    ];
    const tableHeadings = headingList.map((heading) => Object.assign({}, heading, { label: L[heading.key] || '' }));

    function loppupvmAction(value: moment.Moment, idx: number) {
        const newDates = [...dates];
        newDates[idx].loppupvm = value;
        setDates(newDates);
    }

    const data = kayttooikeus.kayttooikeus.filter(_filterExpiredKayttooikeus).map((uusittavaKayttooikeusRyhma, idx) => {
        const organisaatio =
            organisaatioCache[uusittavaKayttooikeusRyhma.organisaatioOid] ||
            StaticUtils.defaultOrganisaatio(uusittavaKayttooikeusRyhma.organisaatioOid, l10n.localisations);
        return {
            kayttooikeusRyhma: uusittavaKayttooikeusRyhma,
            [headingList[0].key]:
                toLocalizedText(locale, organisaatio.nimi) +
                ' ' +
                StaticUtils.getOrganisaatiotyypitFlat(organisaatio.tyypit, L),
            [headingList[1].key]: uusittavaKayttooikeusRyhma.ryhmaNames?.texts.filter(
                (text) => text.lang === locale.toUpperCase()
            )[0].text,
            [headingList[2].key]: moment(uusittavaKayttooikeusRyhma.alkuPvm, PropertySingleton.state.PVM_DBFORMAATTI),
            [headingList[3].key]: moment(
                uusittavaKayttooikeusRyhma.voimassaPvm,
                PropertySingleton.state.PVM_DBFORMAATTI
            ),
            [headingList[4].key]: {
                kasitelty: moment(uusittavaKayttooikeusRyhma.kasitelty),
                kasittelija: uusittavaKayttooikeusRyhma.kasittelijaNimi || uusittavaKayttooikeusRyhma.kasittelijaOid,
            },
            [headingList[5].key]: (
                <div>
                    <div
                        style={{
                            display: 'table-cell',
                            paddingRight: '10px',
                        }}
                    >
                        <DatePicker
                            className="oph-input"
                            onChange={(date) => loppupvmAction(moment(date), idx)}
                            selected={dates[idx].loppupvm.toDate()}
                            showYearDropdown
                            showWeekNumbers
                            disabled={hasNoPermission(
                                uusittavaKayttooikeusRyhma.organisaatioOid,
                                uusittavaKayttooikeusRyhma.ryhmaId
                            )}
                            filterDate={(date) =>
                                Number.isInteger(props.vuosia)
                                    ? moment(date).isBefore(moment().add(props.vuosia, 'years'))
                                    : true
                            }
                            dateFormat={PropertySingleton.getState().PVM_DATEPICKER_FORMAATTI}
                        />
                    </div>
                    <div style={{ display: 'table-cell' }}>
                        <MyonnaButton
                            myonnaAction={() =>
                                updateKayttooikeusryhma(
                                    uusittavaKayttooikeusRyhma.ryhmaId,
                                    KAYTTOOIKEUDENTILA.MYONNETTY,
                                    idx,
                                    uusittavaKayttooikeusRyhma.organisaatioOid
                                )
                            }
                            L={L}
                            disabled={hasNoPermission(
                                uusittavaKayttooikeusRyhma.organisaatioOid,
                                uusittavaKayttooikeusRyhma.ryhmaId
                            )}
                        />
                    </div>
                </div>
            ),
            [headingList[6].key]: (
                <SuljeButton
                    suljeAction={() =>
                        dispatch<any>(
                            removePrivilege(
                                props.oidHenkilo,
                                uusittavaKayttooikeusRyhma.organisaatioOid,
                                uusittavaKayttooikeusRyhma.ryhmaId
                            )
                        )
                    }
                    L={L}
                    disabled={hasNoPermission(
                        uusittavaKayttooikeusRyhma.organisaatioOid,
                        uusittavaKayttooikeusRyhma.ryhmaId
                    )}
                />
            ),
            [headingList[7].key]: notifications.existingKayttooikeus.some((notification) => {
                return notification.ryhmaIdList?.some(
                    (ryhmaId) =>
                        `${ryhmaId}` === `${uusittavaKayttooikeusRyhma.ryhmaId}` &&
                        uusittavaKayttooikeusRyhma.organisaatioOid === notification.organisaatioOid
                );
            }),
            [headingList[8].key]: (
                <div>
                    {createEmailSelectionIfMoreThanOne(idx)}
                    <HaeJatkoaikaaButton
                        haeJatkoaikaaAction={() => _createKayttooikeusAnomus(uusittavaKayttooikeusRyhma, idx)}
                        disabled={isHaeJatkoaikaaButtonDisabled(idx, uusittavaKayttooikeusRyhma)}
                    />
                </div>
            ),
        };
    });

    function updateKayttooikeusryhma(id: number, kayttoOikeudenTila: string, idx: number, organisaatioOid: string) {
        dispatch<any>(
            addKayttooikeusToHenkilo(props.oidHenkilo, organisaatioOid, [
                {
                    id,
                    kayttoOikeudenTila,
                    alkupvm: moment(dates[idx].alkupvm).format(PropertySingleton.state.PVM_DBFORMAATTI),
                    loppupvm: moment(dates[idx].loppupvm).format(PropertySingleton.state.PVM_DBFORMAATTI),
                },
            ])
        );
    }

    function isHaeJatkoaikaaButtonDisabled(idx: number, uusittavaKayttooikeusRyhma: MyonnettyKayttooikeusryhma) {
        const anomusAlreadyExists = !!kayttooikeus.kayttooikeusAnomus.filter(
            (haettuKayttooikeusRyhma) =>
                haettuKayttooikeusRyhma.kayttoOikeusRyhma.id === uusittavaKayttooikeusRyhma.ryhmaId &&
                uusittavaKayttooikeusRyhma.organisaatioOid === haettuKayttooikeusRyhma.anomus.organisaatioOid
        )[0];
        return (
            emailOptions.emailSelection[idx].value === '' ||
            emailOptions.emailOptions.length === 0 ||
            anomusAlreadyExists
        );
    }

    function createEmailSelectionIfMoreThanOne(idx: number): React.ReactNode {
        return emailOptions.emailOptions.length > 1
            ? emailOptions.emailOptions.map((email, idx2) => (
                  <div key={idx2}>
                      <input
                          type="radio"
                          checked={emailOptions.emailSelection[idx].value === email.value}
                          onChange={() =>
                              setEmailOptions({
                                  ...emailOptions,
                                  emailSelection: update(idx, email, emailOptions.emailSelection),
                              })
                          }
                      />
                      <span>{email.value}</span>
                  </div>
              ))
            : null;
    }

    // If grantableKayttooikeus not loaded allow all. Otherwise require it to be in list.
    function hasNoPermission(organisaatioOid: string, kayttooikeusryhmaId: number) {
        return (
            !kayttooikeus.grantableKayttooikeusLoading &&
            !(
                kayttooikeus.grantableKayttooikeus[organisaatioOid] &&
                kayttooikeus.grantableKayttooikeus[organisaatioOid].includes(kayttooikeusryhmaId)
            )
        );
    }

    function showAccessRightGroupDetails(kayttooikeusRyhma) {
        const accessRight = {
            name: localizeTextGroup(kayttooikeusRyhma.ryhmaNames?.texts, locale),
            description: localizeTextGroup(
                [...(kayttooikeusRyhma.ryhmaKuvaus?.texts || []), ...(kayttooikeusRyhma.ryhmaNames?.texts || [])],
                locale
            ),
            onClose: () => setAccessRight(null),
        };
        setAccessRight(accessRight);
    }

    async function _createKayttooikeusAnomus(uusittavaKayttooikeusRyhma: MyonnettyKayttooikeusryhma, idx: number) {
        const kayttooikeusRyhmaIds = [uusittavaKayttooikeusRyhma.ryhmaId];
        const anomusData = {
            organisaatioOrRyhmaOid: uusittavaKayttooikeusRyhma.organisaatioOid,
            email: emailOptions.emailSelection[idx].value,
            perustelut: 'Uusiminen',
            kayttooikeusRyhmaIds,
            anojaOid: props.oidHenkilo,
        };
        await dispatch<any>(createKayttooikeusanomus(anomusData));
        dispatch<any>(fetchAllKayttooikeusAnomusForHenkilo(omattiedot.data.oid));
    }

    function _filterExpiredKayttooikeus(kayttooikeus: MyonnettyKayttooikeusryhma) {
        return (
            kayttooikeus.tila !== KAYTTOOIKEUDENTILA.SULJETTU && kayttooikeus.tila !== KAYTTOOIKEUDENTILA.VANHENTUNUT
        );
    }

    return (
        <div className="henkiloViewUserContentWrapper">
            {accessRight && <AccessRightDetails {...accessRight} />}
            <div className="header">
                <p className="oph-h2 oph-bold">{L['HENKILO_OLEVAT_KAYTTOOIKEUDET_OTSIKKO']}</p>
            </div>
            <Notifications
                notifications={notifications.existingKayttooikeus}
                L={L}
                closeAction={(status, id) => dispatch(removeNotification(status, 'existingKayttooikeus', id))}
            />
            <div>
                <Table
                    getTdProps={() => ({ style: { textOverflow: 'unset' } })}
                    headings={tableHeadings}
                    data={data}
                    noDataText={L['HENKILO_KAYTTOOIKEUS_VOIMASSAOLEVAT_TYHJA']}
                />
            </div>
        </div>
    );
};

export default HenkiloViewExistingKayttooikeus;
