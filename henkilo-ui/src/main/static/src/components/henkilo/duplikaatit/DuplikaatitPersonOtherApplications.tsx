import React from "react"
import PropTypes from "prop-types"
import "./DuplikaatitPersonOtherApplications.css"

export default class DuplikaatitPersonOtherApplications extends React.Component {
    static propTypes = {
        hakemukset: PropTypes.array,
        koodisto: PropTypes.object,
        locale: PropTypes.string,
        styleClasses: PropTypes.string,
        L: PropTypes.object,
    }

    render() {
        return (
            <div>
                {this.props.hakemukset.map(hakemus => {
                    return (
                        <div className="application" key={hakemus.oid}>
                            <span>{hakemus.kansalaisuus || ""}</span>
                            <span>{hakemus.aidinkieli || ""}</span>
                            <span>{hakemus.matkapuhelinnumero || ""}</span>
                            <span>{hakemus.sahkoposti || ""}</span>
                            <span>{hakemus.lahiosoite || ""}</span>
                            <span>{hakemus.postinumero || ""}</span>
                            <span>{hakemus.passinumero || ""}</span>
                            <span>{hakemus.kansallinenIdTunnus || ""}</span>
                            <span>{hakemus.state || ""}</span>
                            <span>
                                {hakemus.href ? (
                                    <a className="oph-link" href={hakemus.href}>
                                        {hakemus.oid}
                                    </a>
                                ) : (
                                    ""
                                )}
                            </span>
                        </div>
                    )
                })}
            </div>
        )
    }
}