// @flow
import React from 'react';
import './PalveluJaKayttooikeusSelections.css';
import type {PalveluJaKayttooikeusSelection} from "./KayttooikeusryhmaPage";
import type {L} from "../../../types/l.type";

type Props = {
    items: Array<PalveluJaKayttooikeusSelection>,
    removeAction: (PalveluJaKayttooikeusSelection) => void,
    L: L
}

const PalveluJaKayttooikeusSelections = (props: Props) =>
    <div className="palvelu-ja-kayttooikeus-list">
            <ul>
                {props.items.map( (item: PalveluJaKayttooikeusSelection, index: number) =>
                    <li className="palvelu-ja-kayttooikeus flex-horizontal" key={index}>
                        <span className="flex-item-1 palvelu-element">{item.palvelu.label}</span>
                        <span className="flex-item-1 kayttooikeus-element">{item.kayttooikeus.label} <button className="oph-button oph-button-cancel" onClick={() => props.removeAction(item) }>{props.L['POISTA']}</button></span>
                    </li>
                )}
            </ul>
    </div>;

export default PalveluJaKayttooikeusSelections;