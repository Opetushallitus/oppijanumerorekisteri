// @flow
import React from 'react'
import type {Koodisto} from '../../../types/domain/koodisto/koodisto.types'
import type {Kansalaisuus} from '../../../types/domain/oppijanumerorekisteri/kansalaisuus.types'
import KoodistoMultiSelect from './KoodistoMultiSelect'

type Props = {
    className?: string,
    placeholder: string,
    koodisto: Koodisto,
    value: ?Array<Kansalaisuus>,
    onChange: (?Array<Kansalaisuus>) => void,
}

/**
 * Komponentti kansalaisuuksien valitsemiseen.
 */
class KansalaisuusMultiSelect extends React.Component<Props> {

    render() {
        return (
            <KoodistoMultiSelect
                className={this.props.className}
                placeholder={this.props.placeholder}
                koodisto={this.props.koodisto}
                value={this.props.value ? this.props.value.map(kansalaisuus => kansalaisuus.kansalaisuusKoodi) : null}
                onChange={this.onChange}
                />
        )
    }

    onChange = (value: ?Array<string>) => {
        this.props.onChange(value ? value.map(value => ({kansalaisuusKoodi: value}: Kansalaisuus)) : null)
    }

}

export default KansalaisuusMultiSelect
