import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, ColumnDef } from '@tanstack/react-table';

import { toLocalizedText } from '../../localizabletext';
import { Locale } from '../../types/locale.type';
import { KutsuRead as Kutsu } from '../../types/domain/kayttooikeus/Kutsu.types';
import OphTable from '../OphTable';
import { useLocalisations } from '../../selectors';

type Props = {
    kutsu?: Kutsu;
};

const emptyArray = [];

export const resolveInvitationRights = (
    kutsu: Kutsu | null | undefined,
    locale: Locale
): Array<{ organisaatio: string; ryhma: string }> =>
    kutsu
        ? kutsu.organisaatiot.flatMap((organisaatio) =>
              organisaatio.kayttoOikeusRyhmat.map((ryhma) => ({
                  organisaatio: toLocalizedText(locale, organisaatio.nimi),
                  ryhma: toLocalizedText(locale, ryhma.nimi),
              }))
          )
        : [];

const KutsuDetails = ({ kutsu }: Props) => {
    const { L, locale } = useLocalisations();
    const columns = useMemo<ColumnDef<{ organisaatio: string; ryhma: string }>[]>(
        () => [
            {
                header: () => L['KUTSU_KAYTTOOIKEUSRYHMAT_MAIN_HEADER'],
                id: 'group',
                columns: [
                    {
                        header: () => L['HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_ORGANISAATIO_HEADER'],
                        accessorFn: (row) => row.organisaatio,
                        id: 'organisaatio',
                    },
                    {
                        header: () => L['HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_KAYTTOOIKEUS_HEADER'],
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
        data: memoizedData ?? emptyArray,
        getCoreRowModel: getCoreRowModel(),
        columns: columns ?? emptyArray,
    });
    return (
        <div className="anoja-kayttooikeusryhmat">
            <OphTable table={table} isLoading={false} />
        </div>
    );
};

export default KutsuDetails;
