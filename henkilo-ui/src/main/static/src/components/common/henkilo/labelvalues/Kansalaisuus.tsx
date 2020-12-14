import React from "react"
import {connect} from "react-redux"
import LabelValue from "./LabelValue"
import StaticUtils from "../../StaticUtils"
import {HenkiloState} from "../../../../reducers/henkilo.reducer"
import {Locale} from "../../../../types/locale.type"
import {Henkilo} from "../../../../types/domain/oppijanumerorekisteri/henkilo.types"
import {ReactSelectOption} from "../../../../types/react-select.types"

type OwnProps = {
    henkiloUpdate: Henkilo
    readOnly: boolean
    updateModelFieldAction: (arg0: any) => void
}

type Props = OwnProps & {
    henkilo: HenkiloState
    koodisto: {
        kansalaisuus: Array<ReactSelectOption>
    }
    locale: Locale
}

const Kansalaisuus = (props: Props) => {
    const kansalaisuus = props.henkiloUpdate
        ? props.henkiloUpdate.kansalaisuus
        : []
    const disabled = StaticUtils.hasHetuAndIsYksiloity(props.henkilo)
    return (
        <div>
            <LabelValue
                readOnly={props.readOnly}
                updateModelFieldAction={(newOption: Array<any>) => {
                    if (newOption === null) {
                        props.updateModelFieldAction({
                            optionsName: "kansalaisuus",
                            value: [kansalaisuus],
                        })
                    } else {
                        props.updateModelFieldAction({
                            optionsName: "kansalaisuus",
                            value: newOption.map(kansalaisuusOption => ({
                                kansalaisuusKoodi: kansalaisuusOption.value,
                            })),
                        })
                    }
                }}
                values={{
                    label: "HENKILO_KANSALAISUUS",
                    data: props.koodisto.kansalaisuus.map(koodi => ({
                        value: koodi.value,
                        label: koodi[props.locale],
                        optionsName: "kansalaisuus",
                    })),
                    selectValue: kansalaisuus.map(
                        kansalaisuus => kansalaisuus.kansalaisuusKoodi,
                    ),
                    disabled: disabled,
                    clearable: false,
                    multiselect: true,
                }}
            />
        </div>
    )
}

const mapStateToProps = state => ({
    henkilo: state.henkilo,
    koodisto: state.koodisto,
    locale: state.locale,
})

export default connect<Props, OwnProps, _, _, _, _>(
    mapStateToProps,
    {},
)(Kansalaisuus)