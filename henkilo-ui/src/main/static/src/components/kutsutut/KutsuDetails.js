// @flow

import React from 'react';
import ReactTable from 'react-table';
import { toLocalizedText } from '../../localizabletext';
import type { Localisations } from '../../types/localisation.type';
import type { Locale } from '../../types/locale.type';
import type { KutsuRead as Kutsu } from '../../types/domain/kayttooikeus/Kutsu.types';

type Props = {
    kutsu: ?Kutsu,
    L: Localisations,
    locale: Locale
};

const resolveInvitationRights = (kutsu: ?Kutsu, locale) =>
    kutsu
        ? kutsu.organisaatiot.flatMap(organisaatio =>
              organisaatio.kayttoOikeusRyhmat.map(ryhma => ({
                  organisaatio: toLocalizedText(locale, organisaatio.nimi),
                  ryhma: toLocalizedText(locale, ryhma.nimi)
              }))
          )
        : [];

const getLocalizedColumns = (L: Localisations) => [
    {
        Header:
            L[
                'HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_ORGANISAATIO_HEADER'
            ],
        accessor: 'organisaatio'
    },
    {
        Header:
            L[
                'HENKILO_KAYTTOOIKEUSANOMUS_KAYTTOOIKEUSRYHMAT_KAYTTOOIKEUS_HEADER'
            ],
        accessor: 'ryhma'
    }
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
