import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { useReactTable, getCoreRowModel, getSortedRowModel, ColumnDef, SortingState } from '@tanstack/react-table';

import { useAppDispatch, type RootState } from '../../../store';
import StaticUtils from '../StaticUtils';
import { toLocalizedText } from '../../../localizabletext';
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
import OphTable from '../../OphTable';

type OwnProps = {
    isOmattiedot: boolean;
    oidHenkilo: string;
};

const HenkiloViewExpiredKayttooikeus = (props: OwnProps) => {
    const [sorting, setSorting] = useState<SortingState>([]);
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

    useEffect(() => {
        setEmailOptions(createEmailOptions(henkilo, _filterExistingKayttooikeus, kayttooikeus.kayttooikeus));
    }, [henkilo, kayttooikeus.kayttooikeus]);

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

    const columns = useMemo<ColumnDef<MyonnettyKayttooikeusryhma, MyonnettyKayttooikeusryhma>[]>(
        () => [
            {
                id: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO',
                header: () => L['HENKILO_KAYTTOOIKEUS_ORGANISAATIO'],
                accessorFn: (row) =>
                    toLocalizedText(
                        locale,
                        (
                            organisaatioCache[row.organisaatioOid] ||
                            StaticUtils.defaultOrganisaatio(row.organisaatioOid, l10n.localisations)
                        ).nimi
                    ),
            },
            {
                id: 'HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS',
                header: () => L['HENKILO_KAYTTOOIKEUS_ORGANISAATIO'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => (
                    <AccessRightDetaisLink<MyonnettyKayttooikeusryhma>
                        cellProps={{
                            value: getValue().ryhmaNames?.texts.filter((text) => text.lang === locale.toUpperCase())[0]
                                .text,
                            original: { kayttooikeusRyhma: getValue() },
                        }}
                        clickHandler={(kayttooikeusRyhma) => showAccessRightGroupDetails(kayttooikeusRyhma)}
                    />
                ),
            },
            {
                id: 'HENKILO_KAYTTOOIKEUS_TILA',
                header: () => L['HENKILO_KAYTTOOIKEUS_TILA'],
                accessorFn: (row) => L[row.tila],
            },
            {
                id: 'HENKILO_KAYTTOOIKEUS_KASITTELIJA',
                header: () => L['HENKILO_KAYTTOOIKEUS_KASITTELIJA'],
                accessorFn: (row) =>
                    moment(row.kasitelty).format() + ' / ' + (row.kasittelijaNimi || row.kasittelijaOid),
            },
            {
                id: 'HENKILO_KAYTTOOIKEUS_JATKOAIKA',
                header: () => L['OMATTIEDOT_HAE_JATKOAIKAA'],
                accessorFn: (row) => row,
                enableSorting: false,
                cell: ({ getValue }) =>
                    getValue().tila === KAYTTOOIKEUDENTILA.VANHENTUNUT &&
                    !hideVanhentunutKayttooikeusUusintaButton(getValue()) ? (
                        <div>
                            {createEmailSelectionIfMoreThanOne(getValue().ryhmaId)}
                            <HaeJatkoaikaaButton
                                haeJatkoaikaaAction={() => _createKayttooikeusAnomus(getValue())}
                                disabled={isHaeJatkoaikaaButtonDisabled(getValue().ryhmaId, getValue())}
                            />
                        </div>
                    ) : (
                        ''
                    ),
            },
        ],
        [emailOptions, kayttooikeus.kayttooikeus, props]
    );

    const table = useReactTable({
        columns,
        data: kayttooikeus.kayttooikeus.filter(_filterExistingKayttooikeus),
        pageCount: 1,
        state: {
            sorting,
            columnVisibility: {
                HENKILO_KAYTTOOIKEUS_JATKOAIKA: props.isOmattiedot,
            },
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="henkiloViewUserContentWrapper">
            {accessRight && <AccessRightDetails {...accessRight} />}
            <div>
                <div className="header">
                    <p className="oph-h2 oph-bold">{L['HENKILO_VANHAT_KAYTTOOIKEUDET_OTSIKKO']}</p>
                </div>
                <OphTable table={table} isLoading={false} />
            </div>
        </div>
    );
};

export default HenkiloViewExpiredKayttooikeus;
