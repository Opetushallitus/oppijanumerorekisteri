import React from 'react';
import type { OnChangeHandler, Options, Option } from 'react-select';

import OphSelect from './OphSelect';
import StaticUtils from '../StaticUtils';
import { useGetKayttooikeusryhmasQuery } from '../../../api/kayttooikeus';
import { useLocalisations } from '../../../selectors';

type OwnProps = {
    kayttooikeusSelectionAction: OnChangeHandler<string, Options<string> | Option<string>>;
    kayttooikeusSelection?: string;
};

export const KayttooikeusryhmaSingleSelect = ({ kayttooikeusSelection, kayttooikeusSelectionAction }: OwnProps) => {
    const { L, locale } = useLocalisations();
    const { data: kayttooikeusryhmat, isLoading } = useGetKayttooikeusryhmasQuery({ passiiviset: false });

    return !isLoading && kayttooikeusryhmat?.length ? (
        <OphSelect
            id="kayttooikeusryhmaFilter"
            options={kayttooikeusryhmat
                .map((kayttooikeusryhma) => ({
                    value: '' + kayttooikeusryhma.id,
                    label: StaticUtils.getLocalisedText(kayttooikeusryhma.description, locale),
                }))
                .sort((a, b) => a.label.localeCompare(b.label))}
            value={`${kayttooikeusSelection}`}
            placeholder={L['HENKILOHAKU_FILTERS_KAYTTOOIKEUSRYHMA_PLACEHOLDER']}
            onChange={(event) => kayttooikeusSelectionAction(event)}
        />
    ) : null;
};
