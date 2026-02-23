import React from 'react';

import { useLocalisations } from '../../../selectors';

import './ItemList.css';

type Props<T> = {
    items: T[];
    removeAction: (arg0: T) => void;
    getItemName: (arg0: T) => string;
};

const ItemList = <T,>({ items, removeAction, getItemName }: Props<T>) => {
    const { L } = useLocalisations();
    return (
        <div className="item-list">
            <ul>
                {items &&
                    items.map((item, index) => (
                        <li className="item-list-element flex-horizontal" key={index}>
                            <span className="flex-item-1">{getItemName(item)}</span>
                            <button className="oph-button oph-button-cancel" onClick={() => removeAction(item)}>
                                {L['POISTA']}
                            </button>
                        </li>
                    ))}
            </ul>
        </div>
    );
};

export default ItemList;
