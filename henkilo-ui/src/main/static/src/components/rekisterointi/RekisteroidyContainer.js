import React from 'react'
import {connect} from 'react-redux'
import RekisteroidyPage from "./RekisteroidyPage";
import {updateNavigation} from "../../actions/navigation.actions";
import {emptyNavi} from "../../configuration/navigationconfigurations";
import {fetchKieliKoodisto} from "../../actions/koodisto.actions";
import Loader from "../common/icons/Loader";
import {createHenkiloByToken, fetchKutsuByToken} from "../../actions/kutsu.actions";
import RekisteroidyVirhe from "./content/RekisteroidyVirhe";
import {removeNotification} from "../../actions/notifications.actions";

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
        let page;
        if(this.props.loginFailed) {
            page = <RekisteroidyVirhe text={'REKISTEROIDY_LOGIN_FAILED'} buttonText={'REKISTEROIDY_KIRJAUTUMISSIVULLE'} />;
        }
        else if(this.loggedIn !== undefined) {
            page = <RekisteroidyVirhe text={'REKISTEROIDY_KIRJAUTUNUT'} />;
        }
        else if(this.props.temporaryTokenInvalid) {
            page =  <RekisteroidyVirhe text={'REKISTEROIDY_TEMP_TOKEN_INVALID'} />;
        }
        else if(this.props.koodistoLoading || this.props.tokenLoading) {
            page = <Loader />;
        }
        else {
            page = <RekisteroidyPage {...this.props} />;
        }
        return <div>{ page }</div>;
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
