import React from 'react'
import {connect} from 'react-redux'
import RekisteroidyPage from "./RekisteroidyPage";
import {updateNavigation} from "../../actions/navigation.actions";
import {emptyNavi} from "../../configuration/navigationconfigurations";

class RekisteroidyContainer extends React.Component {
    componentWillMount() {
        this.props.updateNavigation(emptyNavi);
    }

    render() {
        return <RekisteroidyPage />
    }
}

const mapStateToProps = () => ({

});

export default connect(mapStateToProps, {updateNavigation})(RekisteroidyContainer);
