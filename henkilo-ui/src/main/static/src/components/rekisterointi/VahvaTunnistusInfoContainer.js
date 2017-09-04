import React from 'react'
import {connect} from 'react-redux'
import VahvaTunnistusInfoPage from "./VahvaTunnistusInfoPage";
import {updateNavigation} from "../../actions/navigation.actions";
import {emptyNavi} from "../../configuration/navigationconfigurations";

class VahvaTunnistusInfoContainer extends React.Component {
    componentWillMount() {
        this.props.updateNavigation(emptyNavi)
    }

    render() {
        return <VahvaTunnistusInfoPage {...this.props}/>;
    }
}

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[ownProps.params['locale'].toLowerCase()],
    loginToken: ownProps.params['loginToken'],
    locale: ownProps.params['locale'],
    virhe: ownProps.route.path.indexOf('/vahvatunnistusinfo/virhe/') !== -1,
});

export default connect(mapStateToProps, {updateNavigation})(VahvaTunnistusInfoContainer);
