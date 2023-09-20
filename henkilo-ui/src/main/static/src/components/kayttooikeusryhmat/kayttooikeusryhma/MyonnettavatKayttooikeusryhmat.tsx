import React from 'react';
import './MyonnettavatKayttooikeusryhmat.css';
import OphSelect from '../../common/select/OphSelect';
import type { Option, Options } from 'react-select';
import ItemList from './ItemList';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { useLocalisations } from '../../../selectors';

type Props = {
    kayttooikeusryhmaSelectAction: (selection: Option<string>) => void;
    kayttooikeusryhmaSelections: Options<string>;
    removeKayttooikeusryhmaSelectAction: (selection: Option<string>) => void;
};

const MyonnettavatKayttooikeusryhmat = (props: Props) => {
    const { L, locale } = useLocalisations();
    const allKayttooikeusryhmas = useSelector<RootState, Kayttooikeusryhma[]>(
        (state) => state.kayttooikeus.allKayttooikeusryhmas
    );
    const kayttooikeusryhmaOptions: Options<string> = allKayttooikeusryhmas
        .filter((kayttooikeusryhma) => !kayttooikeusryhma.passivoitu)
        .map((kayttooikeusryhma) => {
            const textObject = kayttooikeusryhma?.description?.texts?.find((t) => t.lang === locale.toUpperCase());
            return {
                label: textObject?.text,
                value: kayttooikeusryhma.id?.toString(),
            };
        });

    return (
        <div className="myonnettavat-kayttooikeusryhmat">
            <h4>{L['KAYTTOOIKEUSRYHMAT_LISAA_MITA_SAA_MYONTAA']}</h4>
            <div className="flex-horizontal">
                <div className="flex-item-1">
                    <OphSelect
                        id="kayttooikeusryhma-myontooikeudet"
                        options={kayttooikeusryhmaOptions}
                        placeholder={L['KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_KAYTTOOIKEUSRYHMA']}
                        onChange={props.kayttooikeusryhmaSelectAction}
                    />
                    <ItemList
                        items={props.kayttooikeusryhmaSelections}
                        labelPath={['label']}
                        removeAction={props.removeKayttooikeusryhmaSelectAction}
                    />
                </div>
                <div className="flex-item-1"></div>
            </div>
        </div>
    );
};

export default MyonnettavatKayttooikeusryhmat;
