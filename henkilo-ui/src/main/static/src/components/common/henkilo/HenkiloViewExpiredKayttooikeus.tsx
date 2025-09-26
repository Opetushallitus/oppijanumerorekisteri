import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { useReactTable, getCoreRowModel, getSortedRowModel, ColumnDef, SortingState } from '@tanstack/react-table';

import { useAppDispatch, type RootState } from '../../../store';
import StaticUtils from '../StaticUtils';
import HaeJatkoaikaaButton from '../../omattiedot/HaeJatkoaikaaButton';
import { createEmailOptions } from '../../../utilities/henkilo.util';
import { HenkiloState } from '../../../reducers/henkilo.reducer';
import {
    createKayttooikeusanomus,
    fetchAllKayttooikeusAnomusForHenkilo,
} from '../../../actions/kayttooikeusryhma.actions';
import { MyonnettyKayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { KAYTTOOIKEUDENTILA } from '../../../globals/KayttooikeudenTila';
import AccessRightDetails, { AccessRight, AccessRightDetaisLink } from './AccessRightDetails';
import { localizeTextGroup } from '../../../utilities/localisation.util';
import { useKayttooikeusryhmas, useLocalisations } from '../../../selectors';
import OphTable from '../../OphTable';
import { useGetOmattiedotQuery, useGetOrganisationsQuery } from '../../../api/kayttooikeus';
import { KayttooikeusRyhmaState } from '../../../reducers/kayttooikeusryhma.reducer';
import Loader from '../icons/Loader';

type OwnProps = {
    isOmattiedot: boolean;
    oidHenkilo: string;
};

const emptyArray = [];

const HenkiloViewExpiredKayttooikeus = (props: OwnProps) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const dispatch = useAppDispatch();
    const { L, locale, l10n } = useLocalisations();
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const kayttooikeus = useSelector<RootState, KayttooikeusRyhmaState>((state) => state.kayttooikeus);
    const { data: kayttooikeusryhmas, isLoading } = useKayttooikeusryhmas(props.isOmattiedot, props.oidHenkilo);
    const { data: organisations, isSuccess } = useGetOrganisationsQuery();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const [emailOptions, setEmailOptions] = useState(
        createEmailOptions(henkilo, _filterExistingKayttooikeus, kayttooikeusryhmas ?? [])
    );
    const [accessRight, setAccessRight] = useState<AccessRight>();

    useEffect(() => {
        setEmailOptions(createEmailOptions(henkilo, _filterExistingKayttooikeus, kayttooikeusryhmas ?? []));
    }, [henkilo, kayttooikeusryhmas]);

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

    function _filterExistingKayttooikeus(kayttooikeus: MyonnettyKayttooikeusryhma) {
        return (
            kayttooikeus.tila === KAYTTOOIKEUDENTILA.SULJETTU || kayttooikeus.tila === KAYTTOOIKEUDENTILA.VANHENTUNUT
        );
    }

    async function _createKayttooikeusAnomus(kayttooikeusryhma: MyonnettyKayttooikeusryhma) {
        const kayttooikeusRyhmaIds = [kayttooikeusryhma.ryhmaId];
        const anomusData = {
            organisaatioOrRyhmaOid: kayttooikeusryhma.organisaatioOid,
            email: emailOptions.emailSelection[kayttooikeusryhma.ryhmaId]?.value,
            perustelut: 'Uusiminen',
            kayttooikeusRyhmaIds,
            anojaOid: props.oidHenkilo,
        };
        await dispatch<any>(createKayttooikeusanomus(anomusData));
        dispatch<any>(fetchAllKayttooikeusAnomusForHenkilo(omattiedot.oidHenkilo));
    }

    function hideVanhentunutKayttooikeusUusintaButton(vanhentunutKayttooikeus: MyonnettyKayttooikeusryhma) {
        // palauttaa true jos vanhentunutKayttooikeus löytyy myös voimassaolevista käyttöoikeuksista
        return !!(kayttooikeusryhmas ?? [])
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
        const anomusAlreadyExists = !!(kayttooikeus.kayttooikeusAnomus ?? []).filter(
            (haettuKayttooikeusRyhma) =>
                haettuKayttooikeusRyhma.kayttoOikeusRyhma.id === vanhentunutKayttooikeusryhma.ryhmaId &&
                vanhentunutKayttooikeusryhma.organisaatioOid === haettuKayttooikeusRyhma.anomus.organisaatioOid
        )[0];
        return (
            emailOptions.emailSelection[ryhmaId]?.value === '' ||
            emailOptions.emailOptions.length === 0 ||
            anomusAlreadyExists
        );
    }

    const columns = useMemo<ColumnDef<MyonnettyKayttooikeusryhma, MyonnettyKayttooikeusryhma>[]>(
        () => [
            {
                id: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO',
                header: () => L['HENKILO_KAYTTOOIKEUS_ORGANISAATIO'],
                accessorFn: (row) => row,
                cell: ({ getValue }) => (
                    <span>
                        {isSuccess
                            ? StaticUtils.getOrganisationNameWithType(
                                  organisations.find((o) => o.oid === getValue().organisaatioOid),
                                  L,
                                  locale
                              )
                            : StaticUtils.defaultOrganisaatio(getValue().organisaatioOid, l10n.localisations).nimi.fi}
                    </span>
                ),
            },
            {
                id: 'HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS',
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
        [emailOptions, kayttooikeusryhmas, props, organisations, isSuccess]
    );

    const memoizedData = useMemo(() => {
        const renderedData = (kayttooikeusryhmas ?? []).filter(_filterExistingKayttooikeus);
        if (!renderedData || !renderedData.length) {
            return undefined;
        }
        return renderedData;
    }, [kayttooikeusryhmas]);

    const table = useReactTable({
        columns: columns ?? emptyArray,
        data: memoizedData ?? emptyArray,
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

    if (isLoading) {
        return <Loader />;
    } else {
        return (
            <div className="henkiloViewUserContentWrapper">
                {accessRight && <AccessRightDetails {...accessRight} />}
                <div>
                    <h2>{L['HENKILO_VANHAT_KAYTTOOIKEUDET_OTSIKKO']}</h2>
                    <OphTable table={table} isLoading={false} />
                </div>
            </div>
        );
    }
};

export default HenkiloViewExpiredKayttooikeus;
