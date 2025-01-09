import React, { ReactNode } from 'react';

import './SortByHeader.css';

type SortDirection = 'ASC' | 'DESC';

type SortInfo = {
    sortBy: string;
    direction: SortDirection;
};

type Props = {
    by: string;
    state: SortInfo;
    onChange: (sortBy: string, direction: SortDirection) => void;
    children: ReactNode;
};

export default class SortByHeader extends React.Component<Props> {
    render() {
        const className = 'sortHeader' + (this.isSelected() ? ' sortedBy' : '');
        return (
            <th className={className} onClick={this.toggle}>
                <span className="text">{this.props.children}</span> {this.symbol()}
            </th>
        );
    }

    isSelected() {
        return this.props.by === this.props.state.sortBy;
    }

    toggle() {
        const direction = this.isSelected() ? (this.props.state.direction === 'ASC' ? 'DESC' : 'ASC') : 'ASC';
        this.props.onChange(this.props.by, direction);
    }

    symbol() {
        return (
            <span className="symbol">
                {this.isSelected() ? (this.props.state.direction === 'ASC' ? '∧' : '∨') : '∧'}
            </span>
        );
    }
}
