import React from "react"
import {Koodisto} from "../../../types/domain/koodisto/koodisto.types"
import {Kansalaisuus} from "../../../types/domain/oppijanumerorekisteri/kansalaisuus.types"
import KoodistoMultiSelect from "./KoodistoMultiSelect"

type KansalaisuusMultiSelectProps = {
    className?: string
    placeholder: string
    koodisto: Koodisto
    value: Array<Kansalaisuus> | null | undefined
    onChange: (arg0: Array<Kansalaisuus> | null | undefined) => void
}

/**
 * Komponentti kansalaisuuksien valitsemiseen.
 */
class KansalaisuusMultiSelect extends React.Component<
    KansalaisuusMultiSelectProps
> {
    render() {
        return (
            <KoodistoMultiSelect
                className={this.props.className}
                placeholder={this.props.placeholder}
                koodisto={this.props.koodisto}
                value={
                    this.props.value
                        ? this.props.value.map(
                              kansalaisuus => kansalaisuus.kansalaisuusKoodi,
                          )
                        : null
                }
                onChange={this.onChange}
            />
        )
    }

    onChange = (value: Array<string> | null | undefined) => {
        this.props.onChange(
            value
                ? value.map(
                      value => ({kansalaisuusKoodi: value} as Kansalaisuus),
                  )
                : null,
        )
    }
}

export default KansalaisuusMultiSelect