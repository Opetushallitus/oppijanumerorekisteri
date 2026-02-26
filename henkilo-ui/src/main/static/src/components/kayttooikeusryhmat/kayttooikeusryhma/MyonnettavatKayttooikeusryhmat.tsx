import React from 'react';
import Select, { SingleValue } from 'react-select';

import ItemList from './ItemList';
import { useLocalisations } from '../../../selectors';
import { useGetKayttooikeusryhmasQuery } from '../../../api/kayttooikeus';
import { SelectOption } from '../../../utilities/select';

import './MyonnettavatKayttooikeusryhmat.css';

type Props = {
    kayttooikeusryhmaSelectAction: (selection: SingleValue<SelectOption>) => void;
    kayttooikeusryhmaSelections: SelectOption[];
    removeKayttooikeusryhmaSelectAction: (selection: SelectOption) => void;
};

const MyonnettavatKayttooikeusryhmat = (props: Props) => {
    const { L, locale } = useLocalisations();
    const { data: allKayttooikeusryhmas } = useGetKayttooikeusryhmasQuery({ passiiviset: false });
    const kayttooikeusryhmaOptions = (allKayttooikeusryhmas ?? []).map((kayttooikeusryhma) => {
        const textObject = kayttooikeusryhma?.description?.texts?.find((t) => t.lang === locale.toUpperCase());
        return {
            label: textObject?.text ?? '',
            value: kayttooikeusryhma.id?.toString(),
        };
    });

    return (
        <div className="myonnettavat-kayttooikeusryhmat">
            <h4>{L('KAYTTOOIKEUSRYHMAT_LISAA_MITA_SAA_MYONTAA')}</h4>
            <div className="flex-horizontal">
                <div className="flex-item-1">
                    <Select
                        id="kayttooikeusryhma-myontooikeudet"
                        options={kayttooikeusryhmaOptions}
                        placeholder={L('KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_KAYTTOOIKEUSRYHMA')}
                        onChange={props.kayttooikeusryhmaSelectAction}
                    />
                    <ItemList
                        items={props.kayttooikeusryhmaSelections}
                        getItemName={(k) => k.label}
                        removeAction={props.removeKayttooikeusryhmaSelectAction}
                    />
                </div>
                <div className="flex-item-1"></div>
            </div>
        </div>
    );
};

export default MyonnettavatKayttooikeusryhmat;
