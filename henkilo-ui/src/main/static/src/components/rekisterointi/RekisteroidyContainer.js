import React from 'react'
import {connect} from 'react-redux'
import RekisteroidyPage from "./RekisteroidyPage";
import {updateNavigation} from "../../actions/navigation.actions";
import {emptyNavi} from "../../configuration/navigationconfigurations";
import {fetchKieliKoodisto} from "../../actions/koodisto.actions";
import Loader from "../common/icons/Loader";
import {fetchKutsuByToken} from "../../actions/kutsu.actions";

class RekisteroidyContainer extends React.Component {
    componentWillMount() {
        this.props.updateNavigation(emptyNavi);

        this.props.fetchKieliKoodisto();
        this.props.fetchKutsuByToken(this.props.temporaryToken);

    }

    render() {
        return <div>
            {
                this.props.koodistoLoading || this.props.tokenLoading
                    ? <Loader />
                    : <RekisteroidyPage {...this.props} />
            }
        </div>
    }
}

const mapStateToProps = (state, ownProps) => {
    return ({
        locale: state.locale,
        L: state.l10n.localisations[state.locale],
        koodistoLoading: state.koodisto.kieliKoodistoLoading,
        koodisto: state.koodisto,
        temporaryToken: ownProps.location.query['kutsuToken'],
        tokenLoading: state.kutsuList.kutsuByTokenLoading,
        kutsu: state.kutsuList.kutsuByToken
    });
};

export default connect(mapStateToProps, {updateNavigation, fetchKieliKoodisto, fetchKutsuByToken})(RekisteroidyContainer);
