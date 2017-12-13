import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css';
import 'react-virtualized-select/styles.css';
import './OphSelect.css';
import React from 'react';
import Select from 'react-virtualized-select';
import IconButton from "../button/IconButton";
import CrossIcon from "../icons/CrossIcon";

const OphSelect = (props) => {
    const clearRenderer = props.clearable
        ? () => {return <IconButton>
            <CrossIcon/>
        </IconButton>}
        : undefined;
    return <Select
        clearable={props.clearable}
        deleteRemoves={false}
        {...props}
        clearRenderer={clearRenderer}
    />;
};

export default OphSelect;
