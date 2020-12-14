import React from "react"
import {connect} from "react-redux"
import LabelValue from "./LabelValue"
import {HenkiloState} from "../../../../reducers/henkilo.reducer"

type OwnProps = {
    isError?: boolean
    readOnly: boolean
    updateModelFieldAction: (arg0: string) => void
    defaultValue?: string
}

type Props = OwnProps & {
    henkilo: HenkiloState
}

const Kutsumanimi = (props: Props) => (
    <LabelValue
        readOnly={props.readOnly}
        updateModelFieldAction={props.updateModelFieldAction}
        values={{
            label: "HENKILO_KUTSUMANIMI",
            value: props.defaultValue || props.henkilo.henkilo.kutsumanimi,
            inputValue: "kutsumanimi",
            isError: props.isError,
        }}
    />
)

const mapStateToProps = state => ({
    henkilo: state.henkilo,
})

export default connect<Props, OwnProps, _, _, _, _>(
    mapStateToProps,
    {},
)(Kutsumanimi)