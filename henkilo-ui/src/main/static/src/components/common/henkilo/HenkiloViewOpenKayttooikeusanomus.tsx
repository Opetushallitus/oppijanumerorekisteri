import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import type { Moment } from 'moment';
import DatePicker from 'react-datepicker';
import { urls } from 'oph-urls-js';

import Table from '../table/Table';
import StaticUtils from '../StaticUtils';
import MyonnaButton from './buttons/MyonnaButton';
import Button from '../button/Button';
import { http } from '../../../http';
import { toLocalizedText } from '../../../localizabletext';
import PopupButton from '../button/PopupButton';
import AnomusHylkaysPopup from '../../anomus/AnomusHylkaysPopup';
import PropertySingleton from '../../../globals/PropertySingleton';
import { OmattiedotState } from '../../../reducers/omattiedot.reducer';
import { AnojaKayttooikeusryhmat } from '../../anomus/AnojaKayttooikeusryhmat';
import { MyonnettyKayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { localize, localizeTextGroup } from '../../../utilities/localisation.util';
import './HenkiloViewOpenKayttooikeusanomus.css';
import { TableCellProps } from '../../../types/react-table.types';
import { KAYTTOOIKEUDENTILA } from '../../../globals/KayttooikeudenTila';
import { KayttooikeusRyhmaState } from '../../../reducers/kayttooikeusryhma.reducer';
import { OrganisaatioCache } from '../../../reducers/organisaatio.reducer';
import AccessRightDetails, { AccessRight, AccessRightDetaisLink } from './AccessRightDetails';
import { HenkilonNimi } from '../../../types/domain/kayttooikeus/HenkilonNimi';
import { RootState, useAppDispatch } from '../../../store';
import {
    fetchAllKayttooikeusAnomusForHenkilo,
    updateHaettuKayttooikeusryhma,
} from '../../../actions/kayttooikeusryhma.actions';
import { useLocalisations } from '../../../selectors';
import { HaettuKayttooikeusryhma } from '../../../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types';

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
    isAnomusView?: boolean;
    manualSortSettings?: {
        manual: boolean;
        defaultSorted: Array<any>;
        onFetchData: (arg0: any) => void;
    };
    fetchMoreSettings?: {
        fetchMoreAction?: () => void;
        isActive?: boolean;
    };
    tableLoading?: boolean;
    striped?: boolean;
    piilotaOtsikko?: boolean;
    kayttooikeus: KayttooikeusRyhmaState;
    updateHaettuKayttooikeusryhmaAlt?: (
        arg0: number,
        arg1: string,
        arg2: string,
        arg3: string,
        arg4: HenkilonNimi,
        arg5: string
    ) => void;
};

type Props = OwnProps;

const _getKayttooikeusAnomukset = (props: Props): Array<HaettuKayttooikeusryhma> => {
    return props.kayttooikeus?.kayttooikeusAnomus ?? [];
};

const HenkiloViewOpenKayttooikeusanomus = (props: Props) => {
    const dispatch = useAppDispatch();
    const { L, locale, l10n } = useLocalisations();
    const organisaatioCache = useSelector<RootState, OrganisaatioCache>((state) => state.organisaatio.cached);
    const omattiedot = useSelector<RootState, OmattiedotState>((state) => state.omattiedot);
    const [dates, setDates] = useState<{ alkupvm: Moment; loppupvm: Moment }[]>(
        _getKayttooikeusAnomukset(props).map(() => ({
            alkupvm: moment(),
            loppupvm: moment().add(1, 'years'),
        }))
    );
    const [kayttooikeusRyhmatByAnoja, setKayttooikeusRyhmatByAnoja] = useState<AnojaKayttooikeusryhmaData[]>([]);
    const [showHylkaysPopup, setShowHylkaysPopup] = useState(false);
    const [disabledHylkaaButtons, setDisabledHylkaaButtons] = useState<{
        [key: number]: boolean;
    }>({});
    const [disabledMyonnettyButtons, setDisabledMyonnettyButtons] = useState<{
        [key: number]: boolean;
    }>({});
    const [accessRight, setAccessRight] = useState<AccessRight>();

    const headingList = [
        { key: 'ANOTTU_PVM', Cell: (cellProps) => cellProps.value?.format() },
        {
            key: 'HENKILO_KAYTTOOIKEUS_NIMI',
            hide: !props.isAnomusView,
            notSortable: props.isAnomusView,
        },
        {
            key: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO',
            minWidth: 220,
            notSortable: props.isAnomusView,
        },
        {
            key: 'HENKILO_KAYTTOOIKEUSANOMUS_ANOTTU_RYHMA',
            minWidth: 220,
            notSortable: props.isAnomusView,
            Cell: (cellProps: TableCellProps) => (
                <AccessRightDetaisLink
                    cellProps={cellProps}
                    clickHandler={(kayttooikeusRyhma) => showAccessRightGroupDetails(kayttooikeusRyhma)}
                />
            ),
        },
        {
            key: 'HENKILO_KAYTTOOIKEUSANOMUS_PERUSTELU',
            minWidth: 70,
            notSortable: true,
        },
        {
            key: 'HENKILO_KAYTTOOIKEUS_ALKUPVM',
            notSortable: props.isAnomusView,
            Cell: (cellProps) => cellProps.value?.format(),
        },
        {
            key: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM',
            localizationKey: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM',
            hide: !props.isOmattiedot,
            notSortable: props.isAnomusView,
            Cell: (cellProps) => cellProps.value?.format(),
        },
        {
            key: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM_MYONTO',
            localizationKey: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM',
            hide: props.isOmattiedot,
            notSortable: true,
        },
        {
            key: 'HENKILO_KAYTTOOIKEUSANOMUS_TYYPPI',
            minWidth: 50,
            notSortable: props.isAnomusView,
        },
        { key: 'EMPTY_PLACEHOLDER', minWidth: 165, notSortable: true },
    ];

    const tableHeadings = headingList.map((heading) => ({
        ...heading,
        label: L[heading.localizationKey ? heading.localizationKey : heading.key],
    }));

    useEffect(() => {
        setDates(
            _getKayttooikeusAnomukset(props).map(() => ({
                alkupvm: moment(),
                loppupvm: moment().add(1, 'years'),
            }))
        );
    }, [props]);

    function loppupvmAction(value: Date, idx: number) {
        const newDates = [...dates];
        newDates[idx].loppupvm = moment(value);
        setDates(newDates);
    }

    const _rows = _getKayttooikeusAnomukset(props).map(
        (haettuKayttooikeusRyhma: HaettuKayttooikeusryhma, idx: number) => ({
            kayttooikeusRyhma: haettuKayttooikeusRyhma.kayttoOikeusRyhma,
            [headingList[0].key]: moment(haettuKayttooikeusRyhma.anomus.anottuPvm),
            [headingList[1].key]:
                haettuKayttooikeusRyhma.anomus.henkilo.etunimet + ' ' + haettuKayttooikeusRyhma.anomus.henkilo.sukunimi,
            [headingList[2].key]:
                toLocalizedText(locale, organisaatioCache[haettuKayttooikeusRyhma.anomus.organisaatioOid].nimi) +
                ' ' +
                StaticUtils.getOrganisaatiotyypitFlat(
                    organisaatioCache[haettuKayttooikeusRyhma.anomus.organisaatioOid].tyypit,
                    L
                ),
            [headingList[3].key]: toLocalizedText(
                locale,
                haettuKayttooikeusRyhma.kayttoOikeusRyhma.nimi,
                haettuKayttooikeusRyhma.kayttoOikeusRyhma.tunniste
            ),
            [headingList[4].key]: createSelitePopupButton(haettuKayttooikeusRyhma.anomus.perustelut),
            [headingList[5].key]: dates[idx]?.alkupvm,
            [headingList[6].key]: dates[idx]?.loppupvm,
            [headingList[7].key]: (
                <DatePicker
                    className="oph-input"
                    onChange={(value) => loppupvmAction(value, idx)}
                    selected={dates[idx]?.loppupvm.toDate()}
                    showYearDropdown
                    showWeekNumbers
                    disabled={hasNoPermission(
                        haettuKayttooikeusRyhma.anomus.organisaatioOid,
                        haettuKayttooikeusRyhma.kayttoOikeusRyhma.id
                    )}
                    filterDate={(date) => moment(date).isBefore(moment().add(1, 'years'))}
                    dateFormat={PropertySingleton.getState().PVM_DATEPICKER_FORMAATTI}
                />
            ),
            [headingList[8].key]: L[haettuKayttooikeusRyhma.anomus.anomusTyyppi],
            [headingList[9].key]: props.isOmattiedot
                ? anomusHandlingButtonsForOmattiedot(haettuKayttooikeusRyhma)
                : anomusHandlingButtonsForHenkilo(haettuKayttooikeusRyhma, idx),
        })
    );

    function createSelitePopupButton(perustelut: string) {
        return (
            <PopupButton
                popupClass={'oph-popup-default oph-popup-bottom'}
                popupButtonWrapperPositioning={'absolute'}
                popupArrowStyles={{ marginLeft: '10px' }}
                popupButtonClasses={'oph-button oph-button-ghost'}
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

    function localUpdateHaettuKayttooikeusryhma(
        id: number,
        tila: string,
        idx: number,
        henkilo: HenkilonNimi,
        hylkaysperuste?: string
    ) {
        const date = dates[idx];
        const alkupvm: string = date?.alkupvm?.format(PropertySingleton.state.PVM_DBFORMAATTI);
        const loppupvm: string = date?.loppupvm?.format(PropertySingleton.state.PVM_DBFORMAATTI);
        if (props.updateHaettuKayttooikeusryhmaAlt) {
            props.updateHaettuKayttooikeusryhmaAlt(id, tila, alkupvm, loppupvm, henkilo, hylkaysperuste ?? '');
        } else {
            dispatch<any>(updateHaettuKayttooikeusryhma(id, tila, alkupvm, loppupvm, henkilo, hylkaysperuste ?? ''));
        }
        if (tila === KAYTTOOIKEUDENTILA.MYONNETTY) {
            setDisabledMyonnettyButtons({ ...disabledMyonnettyButtons, [id]: true });
        }
        if (tila === KAYTTOOIKEUDENTILA.HYLATTY) {
            setDisabledHylkaaButtons({ ...disabledHylkaaButtons, [id]: true });
        }
        setShowHylkaysPopup(false);
    }

    function anomusHandlingButtonsForHenkilo(haettuKayttooikeusRyhma: HaettuKayttooikeusryhma, idx: number) {
        const noPermission = hasNoPermission(
            haettuKayttooikeusRyhma.anomus.organisaatioOid,
            haettuKayttooikeusRyhma.kayttoOikeusRyhma.id
        );
        const henkilo = haettuKayttooikeusRyhma.anomus.henkilo;

        return (
            <div>
                <div className="anomuslistaus-myonnabutton" style={{ display: 'table-cell', paddingRight: '10px' }}>
                    <MyonnaButton
                        myonnaAction={() =>
                            localUpdateHaettuKayttooikeusryhma(
                                haettuKayttooikeusRyhma.id,
                                KAYTTOOIKEUDENTILA.MYONNETTY,
                                idx,
                                henkilo
                            )
                        }
                        L={L}
                        disabled={noPermission || disabledMyonnettyButtons[haettuKayttooikeusRyhma.id]}
                    />
                </div>
                <div style={{ display: 'table-cell' }}>
                    <PopupButton
                        popupClass={'oph-popup-default oph-popup-bottom'}
                        popupTitle={
                            <span className="oph-h3 oph-strong">{L['HENKILO_KAYTTOOIKEUSANOMUS_HYLKAA_HAKEMUS']}</span>
                        }
                        popupArrowStyles={{ marginLeft: '230px' }}
                        popupButtonClasses={'oph-button oph-button-cancel oph-button-small'}
                        popupStyle={{
                            right: '0px',
                            width: '20rem',
                            padding: '30px',
                            position: 'absolute',
                        }}
                        toggle={showHylkaysPopup}
                        disabled={noPermission || disabledHylkaaButtons[haettuKayttooikeusRyhma.id]}
                        popupContent={
                            <AnomusHylkaysPopup
                                L={L}
                                kayttooikeusryhmaId={haettuKayttooikeusRyhma.id}
                                index={idx}
                                henkilo={henkilo}
                                action={localUpdateHaettuKayttooikeusryhma}
                            ></AnomusHylkaysPopup>
                        }
                    >
                        {L['HENKILO_KAYTTOOIKEUSANOMUS_HYLKAA']}
                    </PopupButton>
                </div>
            </div>
        );
    }

    async function cancelAnomus(haettuKayttooikeusRyhma: HaettuKayttooikeusryhma) {
        const url = urls.url('kayttooikeus-service.omattiedot.anomus.muokkaus');
        await http.put(url, haettuKayttooikeusRyhma.id);
        dispatch<any>(fetchAllKayttooikeusAnomusForHenkilo(omattiedot.data.oid));
    }

    // If grantableKayttooikeus not loaded allow all. Otherwise require it to be in list.
    function hasNoPermission(organisaatioOid: string, kayttooikeusryhmaId: number) {
        return (
            !props.kayttooikeus.grantableKayttooikeusLoading &&
            !(
                props.kayttooikeus.grantableKayttooikeus[organisaatioOid] &&
                props.kayttooikeus.grantableKayttooikeus[organisaatioOid].includes(kayttooikeusryhmaId)
            )
        );
    }

    function fetchKayttooikeusryhmatByAnoja(row: any) {
        const anojaOid = props.kayttooikeus.kayttooikeusAnomus[row.index].anomus.henkilo.oid;
        if (!_hasAnojaKayttooikeusData(anojaOid)) {
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
        const organisaatio = organisaatioCache[myonnettyKayttooikeusryhma.organisaatioOid];
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

    const _hasAnojaKayttooikeusData = (anojaOid: string): boolean => {
        return kayttooikeusRyhmatByAnoja.some(
            (anojaKayttooikeusryhmaData: AnojaKayttooikeusryhmaData) => anojaKayttooikeusryhmaData.anojaOid === anojaOid
        );
    };

    function showAccessRightGroupDetails(kayttooikeusRyhma) {
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

    return (
        <div className="henkiloViewUserContentWrapper">
            {accessRight && <AccessRightDetails {...accessRight} />}
            <div>
                {!props.piilotaOtsikko && (
                    <div className="header">
                        <p className="oph-h2 oph-bold">{L['HENKILO_AVOIMET_KAYTTOOIKEUDET_OTSIKKO']}</p>
                    </div>
                )}
                <Table
                    getTdProps={() => ({ style: { textOverflow: 'unset' } })}
                    headings={tableHeadings}
                    data={_rows}
                    noDataText={L['HENKILO_KAYTTOOIKEUS_AVOIN_TYHJA']}
                    {...props.manualSortSettings}
                    fetchMoreSettings={props.fetchMoreSettings}
                    isLoading={props.tableLoading}
                    striped={props.striped}
                    subComponent={props.isAnomusView ? fetchKayttooikeusryhmatByAnoja : undefined}
                />
            </div>
        </div>
    );
};

export default HenkiloViewOpenKayttooikeusanomus;
