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

        this.usertypeprops = this.props.isAdmin
            ? {
                withoutOrganisation: true,
                subOrganisations: true,
                passivoitu: true,
                dublicates: true,
            }
            : {
                withoutOrganisation: false,
                subOrganisations: false,
                passivoitu: false,
                dublicates: false,
            };
    }

    render() {
        return <HenkilohakuPage L={this.props.l10n[this.props.locale]} usertypeprops={this.usertypeprops} />
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
