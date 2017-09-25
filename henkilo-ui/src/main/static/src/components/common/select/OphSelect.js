import 'react-select/dist/react-select.css';
import './OphSelect.css'
import React from 'react'
import Select from 'react-select'

const OphSelect = (props) => {
    return <Select clearable={false} deleteRemoves={false} {...props} />;
};

export default OphSelect;
