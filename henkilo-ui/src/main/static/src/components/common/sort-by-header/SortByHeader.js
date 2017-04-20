import React from 'react'

import './SortByHeader.css';

export default class SortByHeader extends React.Component {
    static propTypes = {
        by: React.PropTypes.string.isRequired,
        state: React.PropTypes.object.isRequired, // {sortBy: <by-field>, direction: 'ASC'|'DESC'}
        onChange: React.PropTypes.func.isRequired // (sortBy: string, direction: 'ASC'|'DESC') => void
    }

    render() {
        const className = "sortHeader" + (this.isSelected() ? " sortedBy" : "");
        return (<th className={className} onClick={this.toggle}><span className="text">{this.props.children}</span> {this.symbol()}</th>);
    }
    
    isSelected() {
        return this.props.by === this.props.state.sortBy;
    }
    
    toggle() {
        const direction = this.isSelected() ? (this.props.state.direction === 'ASC' ? 'DESC' : 'ASC') : "ASC";
        this.props.onChange(this.props.by, direction);
    }
    
    symbol() {
        return <span className="symbol">{this.isSelected() ? (this.props.state.direction === 'ASC' ? "∧" : "∨")
                : "∧"}</span>;
    }
}
