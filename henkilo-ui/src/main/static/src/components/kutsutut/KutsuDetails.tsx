import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, ColumnDef } from '@tanstack/react-table';

import { Locale } from '../../types/locale.type';
import { KutsuRead as Kutsu } from '../../types/domain/kayttooikeus/Kutsu.types';
import OphTable from '../OphTable';
import { useLocalisations } from '../../selectors';

type Props = {
    kutsu?: Kutsu;
};

type Detail = { organisaatio?: string; ryhma?: string };

const emptyData: Detail[] = [];
const emptyColumns: ColumnDef<Detail>[] = [];

export const resolveInvitationRights = (
    kutsu: Kutsu | null | undefined,
    locale: Locale
): { organisaatio?: string; ryhma?: string }[] =>
    kutsu
        ? kutsu.organisaatiot.flatMap((organisaatio) =>
              organisaatio.kayttoOikeusRyhmat.map((ryhma) => ({
                  organisaatio: organisaatio.nimi[locale] ?? organisaatio.nimi.fi,
                  ryhma: ryhma.nimi[locale] ?? ryhma.nimi.fi,
              }))
          )
        : [];

const KutsuDetails = ({ kutsu }: Props) => {
    const { L, locale } = useLocalisations();
    const columns = useMemo<ColumnDef<Detail>[]>(
        () => [
            {
                header: () => L('KUTSU_KAYTTOOIKEUSRYHMAT_MAIN_HEADER'),
                id: 'group',
                columns: [
                    {
                        header: () => L('HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_ORGANISAATIO_HEADER'),
                        accessorFn: (row) => row.organisaatio,
                        id: 'organisaatio',
                    },
                    {
                        header: () => L('HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_KAYTTOOIKEUS_HEADER'),
                        accessorFn: (row) => row.ryhma,
                        id: 'ryhma',
                    },
                ],
            },
        ],
        []
    );

    const memoizedData = useMemo(() => {
        const renderedData = resolveInvitationRights(kutsu, locale);
        if (!renderedData || !renderedData.length) {
            return undefined;
        }
        return renderedData;
    }, [kutsu, locale]);

    const table = useReactTable({
        data: memoizedData ?? emptyData,
        getCoreRowModel: getCoreRowModel(),
        columns: columns ?? emptyColumns,
    });
    return (
        <div className="anoja-kayttooikeusryhmat">
            <OphTable table={table} isLoading={false} />
        </div>
    );
};

export default KutsuDetails;
