import "./LoaderWithText.css"
import React from "react"
import {connect} from "react-redux"
import {Localisations} from "../../../types/localisation.type"
import Loader from "../icons/Loader"

type OwnProps = {
    label?: string
    labelkey: string | null | undefined
}

type Props = OwnProps & {
    L: Localisations
}

const LoaderWithText = (props: Props) => (
    <div className="loader-with-text">
        <Loader />
        <span>
            {props.labelkey ? props.L[props.labelkey] : props.label || ""}
        </span>
    </div>
)

const mapStateToProps = state => ({
    L: state.l10n.localisations[state.locale],
})

export default connect<Props, OwnProps, _, _, _, _>(
    mapStateToProps,
    {},
)(LoaderWithText)