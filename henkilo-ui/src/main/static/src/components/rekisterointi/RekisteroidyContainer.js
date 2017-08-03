import React from 'react'
import {connect} from 'react-redux'
import RekisteroidyPage from "./RekisteroidyPage";
import {updateNavigation} from "../../actions/navigation.actions";
import {emptyNavi} from "../../configuration/navigationconfigurations";
import {fetchKieliKoodisto} from "../../actions/koodisto.actions";
import Loader from "../common/icons/Loader";
import {createHenkiloByToken, fetchKutsuByToken} from "../../actions/kutsu.actions";
import Button from "../common/button/Button";

class RekisteroidyContainer extends React.Component {
    componentWillMount() {
        this.props.updateNavigation(emptyNavi);

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
            page =
                <div className="borderless-wrapper">
                    {this.props.L['REKISTEROIDY_LOGIN_FAILED']}
                    <div>
                        <Button href="/">{this.props.L['REKISTEROIDY_KIRJAUTUMISSIVULLE']}</Button>
                    </div>
                </div>;
        }
        else if(this.loggedIn !== undefined) {
            page =
                <div className="borderless-wrapper">
                    {this.props.L['REKISTEROIDY_KIRJAUTUNUT']}
                </div>;
        }
        else if(this.props.temporaryTokenInvalid) {
            page = <div className="borderless-wrapper">{this.props.L['REKISTEROIDY_TEMP_TOKEN_INVALID']}</div>
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
})(RekisteroidyContainer);
