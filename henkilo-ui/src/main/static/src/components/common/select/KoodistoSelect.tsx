import React from 'react';
import Select from 'react-virtualized-select';
import { connect } from 'react-redux';
import type { RootState } from '../../../store';
import type { Options, Option } from 'react-select';
import { Locale } from '../../../types/locale.type';
import { Koodisto, Koodi } from '../../../types/domain/koodisto/koodisto.types';
import { toLocalizedText } from '../../../localizabletext';
import './KoodistoSelect.css';

type OwnProps = {
    className?: string;
    placeholder: string;
    koodisto: Koodisto;
    value?: string;
    onChange: (arg0: string) => void;
};

type StateProps = {
    locale: Locale;
};

type Props = OwnProps & StateProps;

/**
 * Komponentti koodiston koodin valitsemiseen.
 */
class KoodistoSelect extends React.Component<Props> {
    render() {
        return (
            <Select
                className={this.props.className}
                placeholder={this.props.placeholder}
                noResultsText=""
                options={this.getOptions(this.props.koodisto)}
                value={this.props.value}
                onChange={this.onChange}
            />
        );
    }

    getOptions = (koodisto: Koodisto): Options<string> => {
        return koodisto.map(this.getOption).sort((a, b) => a.label.localeCompare(b.label));
    };

    getOption = (koodi: Koodi) => {
        return {
            value: koodi.koodiArvo,
            label: toLocalizedText(this.props.locale, koodi.metadata, koodi.koodiArvo),
        };
    };

    onChange = (selected: Option<string>) => {
        const value = selected ? selected.value : null;
        this.props.onChange(value);
    };
}

const mapStateToProps = (state: RootState): StateProps => {
    return {
        locale: state.locale,
    };
};

export default connect<StateProps, {}, OwnProps, RootState>(mapStateToProps)(KoodistoSelect);
