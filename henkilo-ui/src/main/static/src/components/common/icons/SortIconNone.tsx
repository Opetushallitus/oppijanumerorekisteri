import './SortIconNone.css';
import React from 'react';

class SortIconNone extends React.Component {
    static createSortIcon(unique) {
        return (
            <span className={'fa-stack fa-lg ' + unique}>
                <i className="fa fa-sort-desc fa-stack-1x" aria-hidden="true"></i>
                <i className="fa fa-sort-asc fa-stack-1x" aria-hidden="true"></i>
            </span>
        );
    }

    render() {
        return SortIconNone.createSortIcon('none');
    }
}

export default SortIconNone;
