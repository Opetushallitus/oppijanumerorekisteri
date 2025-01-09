import React from 'react';
import { path } from 'ramda';

import { useLocalisations } from '../../../selectors';

import './ItemList.css';

type Props<T> = {
    items: Array<T>;
    removeAction: (arg0: T) => void;
    labelPath: Array<string>;
};

/*
 * Simple array of items and remove button for each of them
 *
 * @param items - array of objects (items)
 * @param removeAction - function to run on delete button click
 * @param labelPath - object traversal path to label to be shown in list as an array of strings. For example ['path', 'to', 'label']
 */
const ItemList = <T,>({ items, removeAction, labelPath }: Props<T>) => {
    const { L } = useLocalisations();
    return (
        <div className="item-list">
            <ul>
                {items &&
                    items.map((item, index) => (
                        <li className="item-list-element flex-horizontal" key={index}>
                            <span className="flex-item-1">{path(labelPath, item)}</span>
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
