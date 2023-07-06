import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../store';
import './ItemList.css';
import { path } from 'ramda';
import { Localisations } from '../../../types/localisation.type';

type OwnProps = {
    items: Array<any>;
    removeAction: (arg0: any) => void;
    labelPath: Array<string>;
};

type StateProps = {
    L: Localisations;
};

type Props = OwnProps & StateProps;

/*
 * Simple array of items and remove button for each of them
 *
 * @param items - array of objects (items)
 * @param removeAction - function to run on delete button click
 * @param labelPath - object traversal path to label to be shown in list as an array of strings. For example ['path', 'to', 'label']
 */
const ItemList = (props: Props) => (
    <div className="item-list">
        <ul>
            {props.items &&
                props.items.map((item, index) => (
                    <li className="item-list-element flex-horizontal" key={index}>
                        <span className="flex-item-1">{path(props.labelPath, item)}</span>
                        <button className="oph-button oph-button-cancel" onClick={() => props.removeAction(item)}>
                            {props.L['POISTA']}
                        </button>
                    </li>
                ))}
        </ul>
    </div>
);

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, object, OwnProps, RootState>(mapStateToProps)(ItemList);
