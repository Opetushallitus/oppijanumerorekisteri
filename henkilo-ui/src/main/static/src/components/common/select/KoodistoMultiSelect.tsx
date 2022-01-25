import React from 'react';
import Select from 'react-virtualized-select';
import { connect } from 'react-redux';
import type { RootState } from '../../../reducers';
import { ReactSelectOption } from '../../../types/react-select.types';
import { Locale } from '../../../types/locale.type';
import { Koodisto, Koodi } from '../../../types/domain/koodisto/koodisto.types';
import { toLocalizedText } from '../../../localizabletext';
import './KoodistoMultiSelect.css';

type OwnProps = {
    className?: string;
    placeholder: string;
    koodisto: Koodisto;
    value: any;
    onChange: (arg0: Array<string> | null | undefined) => void;
};

type StateProps = {
    locale: Locale;
};

type Props = OwnProps & StateProps;

/**
 * Komponentti koodiston koodien valitsemiseen.
 */
class KoodistoMultiSelect extends React.Component<Props> {
    render() {
        return (
            <Select
                multi={true}
                className={this.props.className}
                placeholder={this.props.placeholder}
                noResultsText=""
                options={this.getOptions(this.props.koodisto)}
                value={this.props.value}
                onChange={this.onChange}
            />
        );
    }

    getOptions = (koodisto: Koodisto): Array<ReactSelectOption> => {
        return koodisto.map(this.getOption).sort((a, b) => a.label.localeCompare(b.label));
    };

    getOption = (koodi: Koodi) => {
        const locale = this.props.locale.toUpperCase();
        return {
            value: koodi.koodiArvo,
            label: toLocalizedText(locale, koodi.metadata, koodi.koodiArvo),
        };
    };

    onChange = (selected: Array<ReactSelectOption>) => {
        const value = selected ? selected.map((a) => a.value) : null;
        this.props.onChange(value);
    };
}

const mapStateToProps = (state: RootState): StateProps => ({
    locale: state.locale,
});

export default connect<StateProps>(mapStateToProps)(KoodistoMultiSelect);
