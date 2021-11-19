import React from 'react';
import ReactTable from 'react-table';
import { toLocalizedText } from '../../localizabletext';
import { Localisations } from '../../types/localisation.type';
import { Locale } from '../../types/locale.type';
import { KutsuRead as Kutsu } from '../../types/domain/kayttooikeus/Kutsu.types';

type Props = {
    kutsu?: Kutsu;
    L: Localisations;
    locale: Locale;
};

export const resolveInvitationRights = (
    kutsu: Kutsu | null | undefined,
    locale: string
): Array<{ organisaatio: string; ryhma: string }> =>
    kutsu
        ? kutsu.organisaatiot.flatMap((organisaatio) =>
              organisaatio.kayttoOikeusRyhmat.map((ryhma) => ({
                  organisaatio: toLocalizedText(locale, organisaatio.nimi),
                  ryhma: toLocalizedText(locale, ryhma.nimi),
              }))
          )
        : [];

const getLocalizedColumns = (L: Localisations) => [
    {
        Header: L['KUTSU_KAYTTOOIKEUSRYHMAT_MAIN_HEADER'],
        columns: [
            {
                Header: L['HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_ORGANISAATIO_HEADER'],
                accessor: 'organisaatio',
            },
            {
                Header: L['HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_KAYTTOOIKEUS_HEADER'],
                accessor: 'ryhma',
            },
        ],
    },
];

const KutsuDetails = ({ kutsu, L, locale }: Props) => (
    <div className="anoja-kayttooikeusryhmat">
        <ReactTable
            data={resolveInvitationRights(kutsu, locale)}
            columns={getLocalizedColumns(L)}
            showPagination={false}
            minRows={0}
        />
    </div>
);

export default KutsuDetails;
