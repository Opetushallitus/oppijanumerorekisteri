import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css';
import 'react-virtualized-select/styles.css';
import './OphSelect.css';
import React from 'react';
import Select from 'react-virtualized-select';
import IconButton from "../button/IconButton";
import CrossIcon from "../icons/CrossIcon";

const OphSelect = (props) => {
    const clearRender = props.clearableAction
        ? () => <IconButton onClick={props.clearableAction} >
            <CrossIcon/>
        </IconButton>
        : undefined;
    return <Select
        clearable={!!clearRender}
        deleteRemoves={false}
        {...props}
        clearRenderer={clearRender}
    />;
};

export default OphSelect;
