import React from "react"
import LabelValue from "./LabelValue"
import StaticUtils from "../../StaticUtils"

const TyoPuhelin = props => (
    <LabelValue
        {...props}
        values={StaticUtils.findOrCreateYhteystiedotRyhmaFlat(
            props.henkiloUpdate,
            "yhteystietotyyppi2",
            "YHTEYSTIETO_PUHELINNUMERO",
            "HENKILO_TYOPUHELIN",
        )}
    />
)

TyoPuhelin.propTypes = {
    henkiloUpdate: React.PropTypes.object,
}

export default TyoPuhelin