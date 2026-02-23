import React, { useEffect, useId, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useReactTable, getCoreRowModel, getSortedRowModel, ColumnDef, SortingState } from '@tanstack/react-table';

import { useAppDispatch } from '../../../store';
import { defaultOrganisaatio, getOrganisationNameWithType } from '../StaticUtils';
import { createEmailOptions } from '../../../utilities/henkilo.util';
import { MyonnettyKayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { KAYTTOOIKEUDENTILA } from '../../../globals/KayttooikeudenTila';
import AccessRightDetails, { AccessRight, AccessRightDetaisLink } from './AccessRightDetails';
import { localizeTextGroup } from '../../../utilities/localisation.util';
import { useKayttooikeusryhmas, useLocalisations } from '../../../selectors';
import OphTable from '../../OphTable';
import {
    PostKayttooikeusAnomusRequest,
    useGetKayttooikeusAnomuksetForHenkiloQuery,
    useGetOrganisationsQuery,
    usePostKayttooikeusAnomusMutation,
} from '../../../api/kayttooikeus';
import { add } from '../../../slices/toastSlice';
import { useGetHenkiloQuery } from '../../../api/oppijanumerorekisteri';
import ConfirmButton from '../button/ConfirmButton';

type OwnProps = {
    isOmattiedot: boolean;
    oidHenkilo: string;
};

const emptyData: MyonnettyKayttooikeusryhma[] = [];
const emptyColumns: ColumnDef<MyonnettyKayttooikeusryhma>[] = [];

const HenkiloViewExpiredKayttooikeus = (props: OwnProps) => {
    const dispatch = useAppDispatch();
    const [sorting, setSorting] = useState<SortingState>([]);
    const { L, locale, allLocalisations } = useLocalisations();
    const { data: henkilo } = useGetHenkiloQuery(props.oidHenkilo);
    const { data: kayttooikeusryhmas, isLoading } = useKayttooikeusryhmas(props.isOmattiedot, props.oidHenkilo);
    const { data: organisations, isSuccess } = useGetOrganisationsQuery();
    const [postKayttooikeusAnomus] = usePostKayttooikeusAnomusMutation();
    const [emailOptions, setEmailOptions] = useState(
        createEmailOptions(_filterExistingKayttooikeus, kayttooikeusryhmas ?? [], henkilo)
    );
    const [accessRight, setAccessRight] = useState<AccessRight>();
    const { data: anomukset } = useGetKayttooikeusAnomuksetForHenkiloQuery(props.oidHenkilo);

    useEffect(() => {
        setEmailOptions(createEmailOptions(_filterExistingKayttooikeus, kayttooikeusryhmas ?? [], henkilo));
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
        const email = emailOptions.emailSelection[kayttooikeusryhma.ryhmaId]?.value;
        if (!email) {
            return;
        }

        const anomusData: PostKayttooikeusAnomusRequest = {
            organisaatioOrRyhmaOid: kayttooikeusryhma.organisaatioOid,
            email: email,
            perustelut: 'Uusiminen',
            kayttooikeusRyhmaIds: [kayttooikeusryhma.ryhmaId],
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
        const anomusAlreadyExists = !!(anomukset ?? []).filter(
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
                            ? getOrganisationNameWithType(
                                  organisations.find((o) => o.oid === getValue().organisaatioOid),
                                  L,
                                  locale
                              )
                            : defaultOrganisaatio(getValue().organisaatioOid, allLocalisations).nimi.fi}
                    </span>
                ),
            },
            {
                id: 'HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS',
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
                id: 'HENKILO_KAYTTOOIKEUS_TILA',
                header: () => L['HENKILO_KAYTTOOIKEUS_TILA'],
                accessorFn: (row) => L[row.tila],
            },
            {
                id: 'HENKILO_KAYTTOOIKEUS_KASITTELIJA',
                header: () => L['HENKILO_KAYTTOOIKEUS_KASITTELIJA'],
                accessorFn: (row) =>
                    format(parseISO(row.kasitelty), 'd.M.yyyy') + ' / ' + (row.kasittelijaNimi || row.kasittelijaOid),
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
                            <ConfirmButton
                                action={() => _createKayttooikeusAnomus(getValue())}
                                normalLabel={L['OMATTIEDOT_HAE_JATKOAIKAA']}
                                confirmLabel={L['OMATTIEDOT_HAE_JATKOAIKAA_CONFIRM']}
                                disabled={isHaeJatkoaikaaButtonDisabled(getValue().ryhmaId, getValue())}
                            />
                        </div>
                    ) : (
                        ''
                    ),
            },
        ],
        [emailOptions, kayttooikeusryhmas, props, organisations, isSuccess, anomukset]
    );

    const memoizedData = useMemo(() => {
        const renderedData = (kayttooikeusryhmas ?? []).filter(_filterExistingKayttooikeus);
        if (!renderedData || !renderedData.length) {
            return undefined;
        }
        return renderedData;
    }, [kayttooikeusryhmas]);

    const table = useReactTable({
        columns: columns ?? emptyColumns,
        data: memoizedData ?? emptyData,
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

    const sectionLabelId = useId();
    return (
        <section aria-labelledby={sectionLabelId} className="henkiloViewUserContentWrapper">
            {accessRight && <AccessRightDetails {...accessRight} />}
            <h2 id={sectionLabelId}>{L['HENKILO_VANHAT_KAYTTOOIKEUDET_OTSIKKO']}</h2>
            <OphTable table={table} isLoading={isLoading} />
        </section>
    );
};

export default HenkiloViewExpiredKayttooikeus;
