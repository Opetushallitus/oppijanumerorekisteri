import React from 'react';
import SortDescIcon from "../components/common/icons/SortDescIcon";
import SortIconNone from "../components/common/icons/SortIconNone";
import SortAscIcon from "../components/common/icons/SortAscIcon";

const AnomusPageContainer = () => (
    <div className="header">
        <h2>Hyväksymättömät käyttöoikeusanomukset</h2>
        <SortDescIcon/>
        <SortIconNone/>
        <SortAscIcon/>
    </div>
);

export default AnomusPageContainer;

