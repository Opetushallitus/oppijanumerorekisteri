// @flow
import React from 'react';
import {connect} from 'react-redux';
import './ItemList.css';
import * as R from 'ramda';
import type {L} from "../../../types/localisation.type";

type Props = {
    items: Array<any>,
    removeAction: (any) => void,
    labelPath: Array<string>,
    L: L
}

/*
 * Simple array of items and remove button for each of them
 *
 * @param items - array of objects (items)
 * @param removeAction - function to run on delete button click
 * @param labelPath - object traversal path to label to be shown in list as an array of strings. For example ['path', 'to', 'label']
 */
const ItemList = (props: Props) =>
    <div className="item-list">
        <ul>
            {props.items.map( (item, index) =>
                <li className="item-list-element flex-horizontal" key={index}>
                    <span className="flex-item-1">{R.path(props.labelPath, item)}</span>
                    <button className="oph-button oph-button-cancel" onClick={() => props.removeAction(item) }>{props.L['POISTA']}</button>
                </li>
            )}
        </ul>
    </div>;

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale]
});

export default connect(mapStateToProps, {})(ItemList);