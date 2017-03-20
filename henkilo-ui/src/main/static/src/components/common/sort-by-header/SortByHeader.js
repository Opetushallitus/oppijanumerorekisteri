import React from 'react'

import './SortByHeader.css';

const SortByHeader = React.createClass({
    propTypes: {
        by: React.PropTypes.string.isRequired,
        state: React.PropTypes.object.isRequired, // {sortBy: <by-field>, direction: 'ASC'|'DESC'}
        onChange: React.PropTypes.func.isRequired // (sortBy: string, direction: 'ASC'|'DESC') => void
    },

    render: function() {
        const className = "sortHeader" + (this.isSelected() ? " sortedBy" : "");
        return (<th className={className} onClick={this.toggle}><span className="text">{this.props.children}</span> {this.symbol()}</th>);
    },
    
    isSelected: function() {
        return this.props.by === this.props.state.sortBy;
    },
    
    toggle: function() {
        const direction = this.isSelected() ? (this.props.state.direction === 'ASC' ? 'DESC' : 'ASC') : "ASC";
        this.props.onChange(this.props.by, direction);
    },
    
    symbol: function() {
        return <span className="symbol">{this.isSelected() ? (this.props.state.direction === 'ASC' ? "∧" : "∨")
                : "∧"}</span>;
    }
});
export default SortByHeader;