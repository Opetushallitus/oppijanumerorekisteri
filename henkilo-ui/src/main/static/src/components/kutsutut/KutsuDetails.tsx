import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, ColumnDef } from '@tanstack/react-table';

import { toLocalizedText } from '../../localizabletext';
import { Localisations } from '../../types/localisation.type';
import { Locale } from '../../types/locale.type';
import { KutsuRead as Kutsu } from '../../types/domain/kayttooikeus/Kutsu.types';
import OphTable from '../OphTable';

type Props = {
    kutsu?: Kutsu;
    L: Localisations;
    locale: Locale;
};

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

const KutsuDetails = ({ kutsu, L, locale }: Props) => {
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
    const table = useReactTable({
        data: resolveInvitationRights(kutsu, locale),
        getCoreRowModel: getCoreRowModel(),
        columns,
    });
    return (
        <div className="anoja-kayttooikeusryhmat">
            <OphTable table={table} isLoading={false} />
        </div>
    );
};

export default KutsuDetails;
