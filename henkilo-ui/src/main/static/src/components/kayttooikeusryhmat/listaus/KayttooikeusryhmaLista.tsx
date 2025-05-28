import * as React from 'react';

import './KayttooikeusryhmaLista.css';
import KayttooikeusryhmaTiedot from './KayttooikeusryhmaTiedot';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import LocalizedTextGroup from '../../common/LocalizedTextGroup';
import { useLocalisations } from '../../../selectors';

type Props = {
    muokkausoikeus: boolean;
    items: Array<Kayttooikeusryhma>;
};

export const KayttooikeusryhmaLista = ({ items, muokkausoikeus }: Props) => {
    const { L, locale } = useLocalisations();
    const [showItems, setShowItems] = React.useState([]);

    const onToggle = (index: number) => {
        if (showItems.includes(index)) {
            setShowItems(showItems.filter((i) => i !== index));
        } else {
            setShowItems([...showItems, index]);
        }
    };

    const getStatusString = (kayttooikeusryhma: Kayttooikeusryhma) => {
        return kayttooikeusryhma.passivoitu ? ` (${L['KAYTTOOIKEUSRYHMAT_PASSIVOITU']})` : '';
    };

    return (
        <div className="kayttooikeuryhma-lista">
            {items.map((item: Kayttooikeusryhma, index: number) => (
                <div key={item.id} className="kayttooikeuryhma-lista-item">
                    <div
                        className="kayttooikeusryhma-tiedot-header"
                        onClick={() => {
                            onToggle(index);
                        }}
                    >
                        <span>
                            <LocalizedTextGroup locale={locale} texts={item?.nimi?.texts} /> {getStatusString(item)}
                        </span>
                    </div>
                    <KayttooikeusryhmaTiedot
                        muokkausoikeus={muokkausoikeus}
                        L={L}
                        locale={locale}
                        show={showItems.includes(index)}
                        item={item}
                    />
                </div>
            ))}
        </div>
    );
};
