import React from "react"
import {connect} from "react-redux"
import ConfirmButton from "../../button/ConfirmButton"
import {HenkiloState} from "../../../../reducers/henkilo.reducer"
import {Localisations} from "../../../../types/localisation.type"
import {puraYksilointi} from "../../../../actions/henkilo.actions"

type OwnProps = {
    disabled?: boolean
}

type Props = OwnProps & {
    henkilo: HenkiloState
    L: Localisations
    puraYksilointi: (arg0: string) => void
}

const PuraHetuttomanYksilointiButton = (props: Props) =>
    !props.henkilo.henkilo.yksiloityVTJ &&
    !props.henkilo.henkilo.hetu &&
    props.henkilo.henkilo.yksiloity ? (
        <ConfirmButton
            key="purayksilointi"
            action={() =>
                props.puraYksilointi(props.henkilo.henkilo.oidHenkilo)
            }
            normalLabel={props.L["PURA_YKSILOINTI_LINKKI"]}
            confirmLabel={props.L["PURA_YKSILOINTI_LINKKI_CONFIRM"]}
            id="purayksilointi"
            disabled={props.disabled}
        />
    ) : null

const mapStateToProps = state => ({
    henkilo: state.henkilo,
    L: state.l10n.localisations[state.locale],
})

export default connect<Props, OwnProps, _, _, _, _>(mapStateToProps, {
    puraYksilointi,
})(PuraHetuttomanYksilointiButton)