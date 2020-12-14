import React from "react"
import Select from "react-virtualized-select"
import {connect} from "react-redux"
import {ReactSelectOption} from "../../../types/react-select.types"
import {Locale} from "../../../types/locale.type"
import {Koodisto, Koodi} from "../../../types/domain/koodisto/koodisto.types"
import {toLocalizedText} from "../../../localizabletext"
import "./KoodistoSelect.css"

type OwnProps = {
    className?: string
    placeholder: string
    koodisto: Koodisto
    value: string | null | undefined
    onChange: (arg0: string | null | undefined) => void
}

type Props = OwnProps & {
    locale: Locale
}

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
        )
    }

    getOptions = (koodisto: Koodisto): Array<ReactSelectOption> => {
        return koodisto
            .map(this.getOption)
            .sort((a, b) => a.label.localeCompare(b.label))
    }

    getOption = (koodi: Koodi) => {
        const locale = this.props.locale.toUpperCase()
        return {
            value: koodi.koodiArvo,
            label: toLocalizedText(locale, koodi.metadata, koodi.koodiArvo),
        }
    }

    onChange = (selected: ReactSelectOption) => {
        const value = selected ? selected.value : null
        this.props.onChange(value)
    }
}

const mapStateToProps = state => {
    return {
        locale: state.locale,
    }
}

export default connect<Props, OwnProps, _, _, _, _>(
    mapStateToProps,
    {},
)(KoodistoSelect)