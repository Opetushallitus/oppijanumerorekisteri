import React from 'react'
import {connect} from 'react-redux'
import VahvaTunnistusInfoPage from "./VahvaTunnistusInfoPage";
import {updateNavigation} from "../../actions/navigation.actions";
import {emptyNavi} from "../../configuration/navigationconfigurations";
import VirhePage from "../common/error/VirhePage";

class VahvaTunnistusInfoContainer extends React.Component {
    componentWillMount() {
        this.props.updateNavigation(emptyNavi)
    }

    render() {
        return <div>
            {
                this.props.loginToken === 'vanha'
                    ? <VirhePage theme="gray"
                                 topic="VAHVATUNNISTUSINFO_VIRHE_TOKEN_OTSIKKO"
                                 text="VAHVATUNNISTUSINFO_VIRHE_TOKEN_TEKSTI"
                                 buttonText="VAHVATUNNISTUSINFO_VIRHE_TOKEN_LINKKI"
                    />
                    : <VahvaTunnistusInfoPage {...this.props}/>
            }
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[ownProps.params['locale'].toLowerCase()],
    loginToken: ownProps.params['loginToken'],
    locale: ownProps.params['locale'],
    virhe: ownProps.route.path.indexOf('/vahvatunnistusinfo/virhe/') !== -1,
});

export default connect(mapStateToProps, {updateNavigation})(VahvaTunnistusInfoContainer);
