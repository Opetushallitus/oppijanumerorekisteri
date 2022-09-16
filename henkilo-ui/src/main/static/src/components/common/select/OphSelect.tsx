import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css';
import 'react-virtualized-select/styles.css';
import './OphSelect.css';
import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../reducers';
import Select from 'react-virtualized-select';
import IconButton from '../button/IconButton';
import CrossIcon from '../icons/CrossIcon';
import type { Localisations } from '../../../types/localisation.type';
import type { OnChangeHandler, Option, Options } from 'react-select';

type OwnProps = {
    id?: string;
    onChange: OnChangeHandler<string, Option<string> | Options<string>>;
    className?: string;
    options: Options<string>;
    value?: string | string[];
    name?: string;
    placeholder?: string;
    disabled?: boolean;
    clearable?: boolean;
    closeOnSelect?: boolean;
    multiselect?: boolean;
    maxHeight?: number;
    optionHeight?: number | ((options: { option: string }) => number);
    filterOptions?: any;
    noResultsText?: string;
    onBlurResetsInput?: boolean;
};

type StateProps = {
    L: Localisations;
};

type Props = OwnProps & StateProps;

const OphSelect = (props: Props) => {
    const clearRenderer = props.clearable
        ? () => {
              return (
                  <IconButton>
                      <CrossIcon />
                  </IconButton>
              );
          }
        : undefined;

    return (
        <Select
            deleteRemoves={false}
            maxHeight={200}
            {...props}
            clearable={!!props.clearable}
            clearRenderer={clearRenderer}
            clearValueText={props.L['POISTA']}
            multi={props.multiselect}
        />
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, {}, OwnProps, RootState>(mapStateToProps)(OphSelect);
