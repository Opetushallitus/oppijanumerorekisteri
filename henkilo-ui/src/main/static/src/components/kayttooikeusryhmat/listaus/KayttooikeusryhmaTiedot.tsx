import React from "react"
import {Locale} from "../../../types/locale.type"
import {http} from "../../../http"
import {urls} from "oph-urls-js"
import {Kayttooikeusryhma} from "../../../types/domain/kayttooikeus/kayttooikeusryhma.types"
import * as R from "ramda"
import {PalveluRooli} from "../../../types/domain/kayttooikeus/PalveluRooli.types"
import LocalizedTextGroup from "../../common/LocalizedTextGroup"
import "./KayttooikeusryhmaTiedot.css"
import {Localisations} from "../../../types/localisation.type"
import {Link} from "react-router"

type Props = {
    muokkausoikeus: boolean
    item: Kayttooikeusryhma
    locale: Locale
    L: Localisations
    show: boolean
    router: any
}

type State = {
    palvelutRoolit: Array<PalveluRooli>
}

export default class KayttooikeusryhmaTiedot extends React.Component<
    Props,
    State
> {
    state = {
        palvelutRoolit: [],
    }

    async componentWillReceiveProps(nextProps: Props): any {
        if (nextProps.show && R.isEmpty(this.state.palvelutRoolit)) {
            const url = urls.url(
                "kayttooikeus-service.kayttooikeusryhma.palvelurooli",
                this.props.item.id,
            )
            try {
                const data = await http.get(url)
                this.setState({palvelutRoolit: data})
            } catch (error) {
                throw error
            }
        }
    }

    render() {
        const kuvaus: any = R.path(["kuvaus", "texts"], this.props.item)

        return this.props.show ? (
            <div className="kayttooikeusryhma-tiedot">
                <LocalizedTextGroup
                    texts={kuvaus}
                    locale={this.props.locale}
                ></LocalizedTextGroup>
                <div className="flex-horizontal kayttooikeusryhma-tiedot-palvelutroolit-header">
                    <div className="flex-item-1 ">
                        {this.props.L["KAYTTOOIKEUSRYHMAT_LISAA_PALVELU"]}
                    </div>
                    <div className="flex-item-1">
                        {this.props.L["KAYTTOOIKEUSRYHMAT_LISAA_KAYTTOOIKEUS"]}
                    </div>
                    <div className="flex-item-2"></div>
                </div>
                <div className="kayttooikeusryhma-tiedot-palvelutroolit">
                    {this.state.palvelutRoolit.map(
                        (item: PalveluRooli, index: number) => (
                            <div key={index} className="flex-horizontal">
                                <div className="flex-item-1">
                                    <LocalizedTextGroup
                                        locale={this.props.locale}
                                        texts={item.palveluTexts}
                                    ></LocalizedTextGroup>
                                </div>
                                <div className="flex-item-1">
                                    <LocalizedTextGroup
                                        locale={this.props.locale}
                                        texts={item.rooliTexts}
                                    ></LocalizedTextGroup>
                                </div>
                                <div className="flex-item-2"></div>
                            </div>
                        ),
                    )}
                </div>
                <Link
                    to={`/kayttooikeusryhmat/${this.props.item.id}`}
                    className="oph-button oph-button-primary"
                    disabled={!this.props.muokkausoikeus}
                >
                    {this.props.L["MUOKKAA"]}
                </Link>
            </div>
        ) : null
    }
}