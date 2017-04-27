import React from 'react'

class StaticUtils extends React.Component {
    static datePlusOneYear(date) {
        const result = new Date(date);
        result.setDate(result.getDate() + 365);
        return result;
    };

    static ddmmyyyyToDate(date) {
        const from = date.split(".");
        return new Date(from[2], from[1]-1, from[0]);
    };

}

export default StaticUtils;