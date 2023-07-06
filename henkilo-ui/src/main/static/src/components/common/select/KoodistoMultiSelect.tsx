import React from 'react';
import Select from 'react-virtualized-select';
import { connect } from 'react-redux';
import type { RootState } from '../../../store';
import type { OnChangeHandler, Options, Option } from 'react-select';
import { Locale } from '../../../types/locale.type';
import { Koodisto, Koodi } from '../../../types/domain/koodisto/koodisto.types';
import { toLocalizedText } from '../../../localizabletext';
import './KoodistoMultiSelect.css';

type OwnProps = {
    className?: string;
    placeholder: string;
    koodisto: Koodisto;
    value: any;
    onChange: OnChangeHandler<string, Options<string> | Option<string>>;
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
                onChange={this.props.onChange}
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
}

const mapStateToProps = (state: RootState): StateProps => ({
    locale: state.locale,
});

export default connect<StateProps, object, OwnProps, RootState>(mapStateToProps)(KoodistoMultiSelect);
