// @flow
import React from 'react';
import {connect} from 'react-redux';
import './ItemList.css';
import R from 'ramda';

type Props = {
    items: Array<any>,
    removeAction: (string) => void,
    labelPath: Array<string>
}

/*
 * Simple array of items and remove button for each of them
 *
 * @param items - array of objects (items)
 * @param removeAction - function to run on delete button click
 * @param labelPath - object traversal path to label to be shown in list as an array of strings. For example ['path', 'to', 'label']
 */
const ItemList = (props: Props) =>
    <div className="simple-selection-list">
        <ul>
            {props.items.map( (item, index) =>
                <li className="simple-selection-list-element flex-horizontal" key={index}>
                    <span className="flex-item-1">{R.path(props.labelPath, item)}</span>
                    <button className="oph-button oph-button-cancel" onClick={() => props.removeAction(item)}>Poista</button>
                </li>
            )}
        </ul>
    </div>;

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale]
});

export default connect(mapStateToProps, {})(ItemList);