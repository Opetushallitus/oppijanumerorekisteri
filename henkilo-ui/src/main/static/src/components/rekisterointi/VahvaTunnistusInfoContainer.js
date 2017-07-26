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
        return <VahvaTunnistusInfoPage />;
    }
}

const mapStateToProps = (state, ownProps) => ({

});

export default connect(mapStateToProps, {updateNavigation})(VahvaTunnistusInfoContainer);
