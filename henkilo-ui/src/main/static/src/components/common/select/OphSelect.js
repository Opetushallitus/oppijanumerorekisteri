import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css';
import 'react-virtualized-select/styles.css';
import './OphSelect.css';
import React from 'react';
import {connect} from 'react-redux';
import Select from 'react-virtualized-select';
import IconButton from '../button/IconButton';
import CrossIcon from '../icons/CrossIcon';
import type {L} from '../../../types/localisation.type';
import type {ReactSelectOption} from "../../../types/react-select.types";

type Props = {
    L: L,
    onChange: ({label: string, value: string, optionsName: string}) => void,
    className: string,
    options: Array<ReactSelectOption>,
    value: string,
    name?: string,
    placeholder?: string,
    disabled?: boolean,
    clearable?: ?boolean,
}

const OphSelect = (props: Props) => {
    const clearRenderer = props.clearable
        ? () => {return <IconButton>
            <CrossIcon/>
        </IconButton>}
        : undefined;

    return <Select
        deleteRemoves={false}
        maxHeight={200}
        {...props}
        clearable={!!props.clearable}
        clearRenderer={clearRenderer}
        clearValueText={props.L['POISTA']}
    />;
};

const mapStateToProps = state => ({
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps, {})(OphSelect);
