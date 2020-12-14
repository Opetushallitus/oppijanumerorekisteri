import React from "react"
import {connect} from "react-redux"
import RekisteroidyPage from "./RekisteroidyPage"
import {fetchKieliKoodisto} from "../../actions/koodisto.actions"
import Loader from "../common/icons/Loader"
import {
    createHenkiloByToken,
    fetchKutsuByToken,
} from "../../actions/kutsu.actions"
import {removeNotification} from "../../actions/notifications.actions"
import VirhePage from "../common/page/VirhePage"

class RekisteroidyContainer extends React.Component {
    componentWillMount() {
        this.props.fetchKieliKoodisto()
        this.props.fetchKutsuByToken(this.props.temporaryToken)
    }

    constructor(props) {
        super(props)

        this.loggedIn = this.props.loggedIn
    }

    render() {
        if (this.props.koodistoLoading || this.props.tokenLoading) {
            return <Loader />
        } else if (this.loggedIn !== undefined) {
            return <VirhePage text={"REKISTEROIDY_KIRJAUTUNUT"} />
        } else if (this.props.temporaryTokenInvalid) {
            return <VirhePage text={"REKISTEROIDY_TEMP_TOKEN_INVALID"} />
        }
        return (
            <RekisteroidyPage
                {...this.props}
                L={this.props.l10n[this.props.kutsu.asiointikieli]}
                locale={this.props.kutsu.asiointikieli}
            />
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        l10n: state.l10n.localisations,
        koodistoLoading: state.koodisto.kieliKoodistoLoading,
        koodisto: state.koodisto,
        temporaryToken: ownProps.location.query["temporaryKutsuToken"],
        tokenLoading: state.kutsuList.kutsuByTokenLoading,
        kutsu: state.kutsuList.kutsuByToken,
        loginFailed: state.cas.loginFailed,
        loggedIn: state.omattiedot.data.oid,
        omattiedotLoading: state.omattiedot.omattiedotLoading,
        authToken: state.cas.authToken,
        temporaryTokenInvalid: state.cas.temporaryTokenInvalid,
    }
}

export default connect(mapStateToProps, {
    fetchKieliKoodisto,
    fetchKutsuByToken,
    createHenkiloByToken,
    removeNotification,
})(RekisteroidyContainer)