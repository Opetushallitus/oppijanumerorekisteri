// @flow
import React from 'react'
import {connect} from 'react-redux'
import type {Koodisto} from '../../../types/domain/koodisto/koodisto.types'
import type {Kansalaisuus} from '../../../types/domain/oppijanumerorekisteri/kansalaisuus.types'
import KoodistoMultiSelect from './KoodistoMultiSelect'
import {fetchKansalaisuusKoodisto} from "../../../actions/koodisto.actions";

type KansalaisuusMultiSelectProps = {
    className?: string,
    placeholder: string,
    kansalaisuusKoodisto: Koodisto,
    value: ?Array<Kansalaisuus>,
    onChange: (?Array<Kansalaisuus>) => void,
    fetchKansalaisuusKoodisto: () => void,
    kansalaisuusKoodisto: Koodisto,
}

/**
 * Komponentti kansalaisuuksien valitsemiseen.
 */
class KansalaisuusMultiSelect extends React.Component<KansalaisuusMultiSelectProps> {
    componentDidMount() {
        this.props.fetchKansalaisuusKoodisto()
    }

    render() {
        return (
            <KoodistoMultiSelect
                className={this.props.className}
                placeholder={this.props.placeholder}
                koodisto={this.props.kansalaisuusKoodisto}
                value={this.props.value ? this.props.value.map(kansalaisuus => kansalaisuus.kansalaisuusKoodi) : null}
                onChange={this.onChange}
                />
        );
    }

    onChange = (value: ?Array<string>) => {
        this.props.onChange(value ? value.map(value => ({kansalaisuusKoodi: value}: Kansalaisuus)) : null)
    };

}

const mapStateToProps = state => ({
    kansalaisuusKoodisto: state.koodisto.kansalaisuusKoodisto,
});

export default connect(mapStateToProps, {fetchKansalaisuusKoodisto})(KansalaisuusMultiSelect);
