import React from 'react'
import {connect} from 'react-redux'
import RekisteroidyPage from "./RekisteroidyPage";
import {updateNavigation} from "../../actions/navigation.actions";
import {emptyNavi} from "../../configuration/navigationconfigurations";
import {fetchKieliKoodisto} from "../../actions/koodisto.actions";
import Loader from "../common/icons/Loader";

class RekisteroidyContainer extends React.Component {
    componentWillMount() {
        this.props.updateNavigation(emptyNavi);

        this.props.fetchKieliKoodisto();
    }

    render() {
        return <div>
            {
                this.props.koodistoLoading
                    ? <Loader />
                    : <RekisteroidyPage {...this.props} />
            }
        </div>
    }
}

const mapStateToProps = (state, ownProps) => ({
    locale: state.locale,
    L: state.l10n.localisations[state.locale],
    koodistoLoading: state.koodisto.kieliKoodistoLoading,
    koodisto: state.koodisto,
});

export default connect(mapStateToProps, {updateNavigation, fetchKieliKoodisto})(RekisteroidyContainer);
