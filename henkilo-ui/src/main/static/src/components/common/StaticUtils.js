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

    static updateFieldByDotAnnotation(obj, path, value) {
        let schema = obj;  // a moving reference to internal objects within obj
        const pList = path.split('.');
        const len = pList.length;
        for(let i = 0; i < len-1; i++) {
            let elem = pList[i];
            if( !schema[elem] ) {
                schema[elem] = {};
            }
            schema = schema[elem];
        }

        schema[pList[len-1]] = value;
    }
}

export default StaticUtils;