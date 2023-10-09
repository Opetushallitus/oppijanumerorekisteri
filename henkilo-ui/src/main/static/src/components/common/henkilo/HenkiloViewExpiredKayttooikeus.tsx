import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';

import { useAppDispatch, type RootState } from '../../../store';
import Table from '../table/Table';
import StaticUtils from '../StaticUtils';
import { toLocalizedText } from '../../../localizabletext';
import { TableCellProps } from '../../../types/react-table.types';
import { KayttooikeusRyhmaState } from '../../../reducers/kayttooikeusryhma.reducer';
import HaeJatkoaikaaButton from '../../omattiedot/HaeJatkoaikaaButton';
import { createEmailOptions } from '../../../utilities/henkilo.util';
import { HenkiloState } from '../../../reducers/henkilo.reducer';
import {
    createKayttooikeusanomus,
    fetchAllKayttooikeusAnomusForHenkilo,
} from '../../../actions/kayttooikeusryhma.actions';
import { MyonnettyKayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { OmattiedotState } from '../../../reducers/omattiedot.reducer';
import { KAYTTOOIKEUDENTILA } from '../../../globals/KayttooikeudenTila';
import AccessRightDetails, { AccessRight, AccessRightDetaisLink } from './AccessRightDetails';
import { localizeTextGroup } from '../../../utilities/localisation.util';
import { OrganisaatioCache } from '../../../reducers/organisaatio.reducer';
import { useLocalisations } from '../../../selectors';

type OwnProps = {
    isOmattiedot: boolean;
    oidHenkilo: string;
};

const HenkiloViewExpiredKayttooikeus = (props: OwnProps) => {
    const dispatch = useAppDispatch();
    const { L, locale, l10n } = useLocalisations();
    const kayttooikeus = useSelector<RootState, KayttooikeusRyhmaState>((state) => state.kayttooikeus);
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const organisaatioCache = useSelector<RootState, OrganisaatioCache>((state) => state.organisaatio.cached);
    const omattiedot = useSelector<RootState, OmattiedotState>((state) => state.omattiedot);
    const [emailOptions, setEmailOptions] = useState(
        createEmailOptions(henkilo, _filterExistingKayttooikeus, kayttooikeus.kayttooikeus)
    );
    const [accessRight, setAccessRight] = useState<AccessRight>();

    const headingList = [
        { key: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO' },
        {
            key: 'HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS',
            Cell: (cellProps: TableCellProps) => (
                <AccessRightDetaisLink
                    cellProps={cellProps}
                    clickHandler={(kayttooikeusRyhma) => showAccessRightGroupDetails(kayttooikeusRyhma)}
                />
            ),
        },
        { key: 'HENKILO_KAYTTOOIKEUS_TILA' },
        {
            key: 'HENKILO_KAYTTOOIKEUS_KASITTELIJA',
            minWidth: 150,
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
            key: 'HENKILO_ANO_KAYTTOOIKEUDELLE_JATKOA',
            notSortable: true,
            hide: !props.isOmattiedot,
        },
    ];
    const tableHeadings = headingList.map((heading) => ({
        ...heading,
        label: L[heading.key],
    }));

    useEffect(() => {
        setEmailOptions(createEmailOptions(henkilo, _filterExistingKayttooikeus, kayttooikeus.kayttooikeus));
    }, [henkilo, kayttooikeus.kayttooikeus]);

    const _rows = kayttooikeus.kayttooikeus
        .filter(_filterExistingKayttooikeus)
        .map((vanhentunutKayttooikeus: MyonnettyKayttooikeusryhma) => ({
            kayttooikeusRyhma: vanhentunutKayttooikeus,
            [headingList[0].key]: toLocalizedText(
                locale,
                (
                    organisaatioCache[vanhentunutKayttooikeus.organisaatioOid] ||
                    StaticUtils.defaultOrganisaatio(vanhentunutKayttooikeus.organisaatioOid, l10n.localisations)
                ).nimi
            ),
            [headingList[1].key]: vanhentunutKayttooikeus.ryhmaNames?.texts.filter(
                (text) => text.lang === locale.toUpperCase()
            )[0].text,
            [headingList[2].key]: L[vanhentunutKayttooikeus.tila],
            [headingList[3].key]: {
                kasitelty: moment(vanhentunutKayttooikeus.kasitelty),
                kasittelija: vanhentunutKayttooikeus.kasittelijaNimi || vanhentunutKayttooikeus.kasittelijaOid,
            },
            [headingList[4].key]: vanhentunutKayttooikeus.tila === KAYTTOOIKEUDENTILA.VANHENTUNUT &&
                !hideVanhentunutKayttooikeusUusintaButton(vanhentunutKayttooikeus) && (
                    <div>
                        {createEmailSelectionIfMoreThanOne(vanhentunutKayttooikeus.ryhmaId)}
                        <HaeJatkoaikaaButton
                            haeJatkoaikaaAction={() => _createKayttooikeusAnomus(vanhentunutKayttooikeus)}
                            disabled={isHaeJatkoaikaaButtonDisabled(
                                vanhentunutKayttooikeus.ryhmaId,
                                vanhentunutKayttooikeus
                            )}
                        />
                    </div>
                ),
        }));

    function showAccessRightGroupDetails(kayttooikeusRyhma: MyonnettyKayttooikeusryhma) {
        const accessRight: AccessRight = {
            name: localizeTextGroup(kayttooikeusRyhma.ryhmaNames.texts, locale),
            description: localizeTextGroup(
                [...(kayttooikeusRyhma.ryhmaKuvaus?.texts || []), ...kayttooikeusRyhma.ryhmaNames.texts],
                locale
            ),
            onClose: () => setAccessRight(undefined),
        };
        setAccessRight(accessRight);
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

    function _filterExistingKayttooikeus(kayttooikeus: MyonnettyKayttooikeusryhma) {
        return (
            kayttooikeus.tila === KAYTTOOIKEUDENTILA.SULJETTU || kayttooikeus.tila === KAYTTOOIKEUDENTILA.VANHENTUNUT
        );
    }

    async function _createKayttooikeusAnomus(kayttooikeusryhma: MyonnettyKayttooikeusryhma) {
        const kayttooikeusRyhmaIds = [kayttooikeusryhma.ryhmaId];
        const anomusData = {
            organisaatioOrRyhmaOid: kayttooikeusryhma.organisaatioOid,
            email: emailOptions.emailSelection[kayttooikeusryhma.ryhmaId].value,
            perustelut: 'Uusiminen',
            kayttooikeusRyhmaIds,
            anojaOid: props.oidHenkilo,
        };
        await dispatch<any>(createKayttooikeusanomus(anomusData));
        dispatch<any>(fetchAllKayttooikeusAnomusForHenkilo(omattiedot.data.oid));
    }

    function hideVanhentunutKayttooikeusUusintaButton(vanhentunutKayttooikeus: MyonnettyKayttooikeusryhma) {
        // palauttaa true jos vanhentunutKayttooikeus löytyy myös voimassaolevista käyttöoikeuksista
        return !!kayttooikeus.kayttooikeus
            .filter(
                (kayttooikeus: MyonnettyKayttooikeusryhma) =>
                    kayttooikeus.tila !== KAYTTOOIKEUDENTILA.SULJETTU &&
                    kayttooikeus.tila !== KAYTTOOIKEUDENTILA.VANHENTUNUT
            )
            .reduce((previous: boolean, current: MyonnettyKayttooikeusryhma) => {
                return (
                    previous ||
                    (current.organisaatioOid === vanhentunutKayttooikeus.organisaatioOid &&
                        current.ryhmaId === vanhentunutKayttooikeus.ryhmaId)
                );
            }, false);
    }

    function isHaeJatkoaikaaButtonDisabled(ryhmaId: number, vanhentunutKayttooikeusryhma: MyonnettyKayttooikeusryhma) {
        const anomusAlreadyExists = !!kayttooikeus.kayttooikeusAnomus.filter(
            (haettuKayttooikeusRyhma) =>
                haettuKayttooikeusRyhma.kayttoOikeusRyhma.id === vanhentunutKayttooikeusryhma.ryhmaId &&
                vanhentunutKayttooikeusryhma.organisaatioOid === haettuKayttooikeusRyhma.anomus.organisaatioOid
        )[0];
        return (
            emailOptions.emailSelection[ryhmaId].value === '' ||
            emailOptions.emailOptions.length === 0 ||
            anomusAlreadyExists
        );
    }

    return (
        <div className="henkiloViewUserContentWrapper">
            {accessRight && <AccessRightDetails {...accessRight} />}
            <div>
                <div className="header">
                    <p className="oph-h2 oph-bold">{L['HENKILO_VANHAT_KAYTTOOIKEUDET_OTSIKKO']}</p>
                </div>
                <div>
                    <Table
                        getTdProps={() => ({ style: { textOverflow: 'unset' } })}
                        headings={tableHeadings}
                        data={_rows}
                        noDataText={L['HENKILO_KAYTTOOIKEUS_SULKEUTUNEET_TYHJA']}
                    />
                </div>
            </div>
        </div>
    );
};

export default HenkiloViewExpiredKayttooikeus;
