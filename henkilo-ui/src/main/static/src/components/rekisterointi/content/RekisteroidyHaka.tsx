import React from "react"
import {urls} from "oph-urls-js"
import PropTypes from "prop-types"
import {connect} from "react-redux"
import Asiointikieli from "../../common/henkilo/labelvalues/Asiointikieli"
import IconButton from "../../common/button/IconButton"
import HakaIcon from "../../common/icons/HakaIcon"

class RekisteroidyPerustiedot extends React.Component {
    static propTypes = {
        henkilo: PropTypes.shape({
            henkilo: PropTypes.shape({
                etunimet: PropTypes.string,
                sukunimi: PropTypes.string,
                kutsumanimi: PropTypes.string,
            }),
            username: PropTypes.string,
            password: PropTypes.string,
            passwordAgain: PropTypes.string,
        }).isRequired,
        updatePayloadModel: PropTypes.func.isRequired,
        koodisto: PropTypes.shape({
            kieli: PropTypes.array.isRequired,
        }).isRequired,
        temporaryKutsuToken: PropTypes.string.isRequired,
    }

    render() {
        const hakaLoginUrl = urls.url(
            "cas.haka",
            {temporaryToken: this.props.temporaryKutsuToken} || {},
        )
        return (
            <div>
                <p className="oph-h3 oph-bold">
                    {this.props.L["REKISTEROIDY_HAKA_OTSIKKO"]}
                </p>
                <Asiointikieli
                    koodisto={this.props.koodisto}
                    henkiloUpdate={this.props.henkilo.henkilo}
                    updateModelFieldAction={this.props.updatePayloadModel}
                />
                <IconButton href={hakaLoginUrl}>
                    <HakaIcon />
                </IconButton>
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[state.locale],
})

export default connect(mapStateToProps)(RekisteroidyPerustiedot)