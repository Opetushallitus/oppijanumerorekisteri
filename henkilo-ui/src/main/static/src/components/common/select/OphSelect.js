import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css';
import 'react-virtualized-select/styles.css';
import './OphSelect.css';
import React from 'react';
import Select from 'react-virtualized-select';

const OphSelect = (props) => {
    return <Select clearable={false} deleteRemoves={false} {...props} />;
};

export default OphSelect;
