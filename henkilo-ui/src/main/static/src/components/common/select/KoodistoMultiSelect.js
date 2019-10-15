// @flow
import React from 'react'
import Select from 'react-virtualized-select'
import {connect} from 'react-redux'
import type {ReactSelectOption} from '../../../types/react-select.types'
import type {Locale} from '../../../types/locale.type'
import type {Koodisto, Koodi} from '../../../types/domain/koodisto/koodisto.types'
import {toLocalizedText} from '../../../localizabletext'
import './KoodistoMultiSelect.css'

type OwnProps = {
    className?: string,
    placeholder: string,
    koodisto: Koodisto,
    value: any,
    onChange: (?Array<string>) => void,
}

type Props = {
    ...OwnProps,
    locale: Locale,
}

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
        )
    }

    getOptions = (koodisto: Koodisto): Array<ReactSelectOption> => {
        return koodisto
            .map(this.getOption)
            .sort((a, b) => a.label.localeCompare(b.label))
    };

    getOption = (koodi: Koodi) => {
        const locale = this.props.locale.toUpperCase();
        return {
            value: koodi.koodiArvo,
            label: toLocalizedText(locale, koodi.metadata, koodi.koodiArvo),
        }
    };

    onChange = (selected: Array<ReactSelectOption>) => {
        const value = selected ? selected.map(a => a.value) : null;
        this.props.onChange(value)
    }

}

const mapStateToProps = (state) => {
    return {
        locale: state.locale,
    }
};

export default connect<Props, OwnProps, _, _, _, _>(mapStateToProps, {})(KoodistoMultiSelect)
