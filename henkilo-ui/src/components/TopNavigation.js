import React, {Component} from 'react';
import {Link} from 'react-router';

import './TopNavigation.css';
import {mainNavigation} from '../configuration/navigationconfigurations';

export default class TopNavigation extends Component {

    static propTypes = {
        items: React.PropTypes.arrayOf(React.PropTypes.object),
        oid: React.PropTypes.string
    };

    constructor(props) {
        super(props);
        this.state = {
            tabs: mainNavigation
        }
    }

    render() {
        return (
            <div id="topNavigation">
                <ul className="tabs">
                    {this.state.tabs.map(this.renderTab)}
                </ul>
            </div>
        )
    }

    renderTab(data, index) {
        return (
            <li className="oph" key={index}>
                <Link to={data.path}>{data.label}</Link>
            </li>)
    }

    changeViewAction(to) {
        return () => {
            // navigateTo(to);
        };
    }
}

