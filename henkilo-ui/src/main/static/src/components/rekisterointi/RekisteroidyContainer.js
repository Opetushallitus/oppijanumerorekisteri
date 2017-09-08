import React from 'react'
import {connect} from 'react-redux'
import RekisteroidyPage from "./RekisteroidyPage";
import {updateNavigation} from "../../actions/navigation.actions";
import {emptyNavi} from "../../configuration/navigationconfigurations";
import {fetchKieliKoodisto} from "../../actions/koodisto.actions";
import Loader from "../common/icons/Loader";
import {createHenkiloByToken, fetchKutsuByToken} from "../../actions/kutsu.actions";
import {removeNotification} from "../../actions/notifications.actions";
import VirhePage from "../common/error/VirhePage";

class RekisteroidyContainer extends React.Component {
    componentWillMount() {
        this.props.updateNavigation(emptyNavi, null, '#f6f4f0');

        this.props.fetchKieliKoodisto();
        this.props.fetchKutsuByToken(this.props.temporaryToken);
    }
    constructor(props) {
        super(props);

        this.loggedIn = this.props.loggedIn;
    }

    render() {
        if(this.props.loginFailed) {
            return <VirhePage text={'REKISTEROIDY_LOGIN_FAILED'} buttonText={'REKISTEROIDY_KIRJAUTUMISSIVULLE'} />;
        }
        else if(this.loggedIn !== undefined) {
            return <VirhePage text={'REKISTEROIDY_KIRJAUTUNUT'} />;
        }
        else if(this.props.temporaryTokenInvalid) {
            return <VirhePage text={'REKISTEROIDY_TEMP_TOKEN_INVALID'} />;
        }
        else if(this.props.koodistoLoading || this.props.tokenLoading) {
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
        loggedIn: state.omattiedot.data,
        omattiedotLoading: state.omattiedot.omattiedotLoading,
        authToken: state.cas.authToken,
        temporaryTokenInvalid: state.cas.temporaryTokenInvalid,
    });
};

export default connect(mapStateToProps, {updateNavigation, fetchKieliKoodisto, fetchKutsuByToken, createHenkiloByToken,
removeNotification})(RekisteroidyContainer);
