import React from 'react';
import {Link} from 'react-router';
import classNames from 'classnames/bind';

import './TopNavigation.css';

const TopNavigation = ({tabs, pathName, backButton, l10n}) => {
    return (
        <div id="topNavigation">
            {backButton ? <Link className="oph-link oph-link-big" to={backButton} >&#8701; {l10n['TAKAISIN_LINKKI']}</Link> : null}
            <ul className="tabs">
                {tabs.map((data, index) => {
                    console.log(data.path);
                    console.log(pathName);
                    const className = classNames({
                        'active': data.path === pathName
                    });
                    return <li key={index}>
                        <Link className={className} to={data.path}>{data.label}</Link>
                    </li>;
                    }
                )}
            </ul>
        </div>
    )
};

export default TopNavigation;
