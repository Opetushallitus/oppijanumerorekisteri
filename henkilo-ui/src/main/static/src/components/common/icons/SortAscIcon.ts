import './SortAscIcon.css';
import React from 'react';
import SortIconNone from './SortIconNone';

class SortAscIcon extends React.Component {
    render() {
        return SortIconNone.createSortIcon('oph-sort-asc');
    }
}

export default SortAscIcon;
