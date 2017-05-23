import React from 'react'
import HenkilohakuPage from "./HenkilohakuPage";
import {connect} from 'react-redux';

class HenkilohakuContainer extends React.Component {
    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);

        this.initialCriteria = this.props.isAdmin
            ? {
                noOrganisation: true,
                subOrganisation: true,
                passivoitu: true,
                dublicates: true,
            }
            : {
                noOrganisation: false,
                subOrganisation: false,
                passivoitu: false,
                dublicates: false,
            };
    };

    render() {
        return <HenkilohakuPage L={this.props.l10n[this.props.locale]} initialCriteria={this.initialCriteria} />
    };
}

const mapStateToProps = (state, ownProps) => {
    return {
        l10n: state.l10n.localisations,
        locale: state.locale,
        isAdmin: state.omattiedot.isAdmin,
    };
};


export default connect(mapStateToProps, {})(HenkilohakuContainer);
