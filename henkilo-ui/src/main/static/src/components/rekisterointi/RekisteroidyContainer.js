import React from 'react'
import {connect} from 'react-redux'
import RekisteroidyPage from "./RekisteroidyPage";
import {updateUnauthenticatedNavigation} from "../../actions/navigation.actions";
import {emptyNavi} from "../navigation/navigationconfigurations";
import {fetchKieliKoodisto} from "../../actions/koodisto.actions";
import Loader from "../common/icons/Loader";
import {createHenkiloByToken, fetchKutsuByToken} from "../../actions/kutsu.actions";
import {removeNotification} from "../../actions/notifications.actions";
import VirhePage from "../common/page/VirhePage";

class RekisteroidyContainer extends React.Component {
    componentWillMount() {
        this.props.updateUnauthenticatedNavigation(emptyNavi, null, '#f6f4f0');

        this.props.fetchKieliKoodisto();
        this.props.fetchKutsuByToken(this.props.temporaryToken);
    }
    constructor(props) {
        super(props);

        this.loggedIn = this.props.loggedIn;
    }

    render() {
        if (this.props.loginFailed) {
            return <VirhePage text={'REKISTEROIDY_LOGIN_FAILED'} buttonText={'REKISTEROIDY_KIRJAUTUMISSIVULLE'} />;
        }
        else if (this.loggedIn !== undefined) {
            return <VirhePage text={'REKISTEROIDY_KIRJAUTUNUT'} />;
        }
        else if (this.props.temporaryTokenInvalid) {
            return <VirhePage text={'REKISTEROIDY_TEMP_TOKEN_INVALID'} />;
        }
        else if (this.props.koodistoLoading || this.props.tokenLoading) {
            return <Loader />;
        }
        return <RekisteroidyPage {...this.props} />;
    }
}

const mapStateToProps = (state, ownProps) => {
    return ({
        locale: state.locale,
        L: state.l10n.localisations[state.locale],
        koodistoLoading: state.koodisto.kieliKoodistoLoading,
        koodisto: state.koodisto,
        temporaryToken: ownProps.location.query['temporaryKutsuToken'],
        tokenLoading: state.kutsuList.kutsuByTokenLoading,
        kutsu: state.kutsuList.kutsuByToken,
        loginFailed: state.cas.loginFailed,
        loggedIn: state.omattiedot.data.oid,
        omattiedotLoading: state.omattiedot.omattiedotLoading,
        authToken: state.cas.authToken,
        temporaryTokenInvalid: state.cas.temporaryTokenInvalid,
    });
};

export default connect(mapStateToProps, {updateUnauthenticatedNavigation, fetchKieliKoodisto, fetchKutsuByToken, createHenkiloByToken,
removeNotification})(RekisteroidyContainer);
