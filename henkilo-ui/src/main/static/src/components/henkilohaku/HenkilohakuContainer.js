import React from 'react'
import PropTypes from 'prop-types'
import HenkilohakuPage from "./HenkilohakuPage";
import {connect} from 'react-redux';
import {fetchOmattiedotOrganisaatios} from "../../actions/omattiedot.actions";
import Loader from "../common/icons/Loader";
import {fetchAllKayttooikeusryhma} from "../../actions/kayttooikeusryhma.actions";
import {clearHenkilohaku, henkilohaku, updateFilters} from "../../actions/henkilohaku.actions";
import {fetchAllRyhmas} from "../../actions/organisaatio.actions";
import {removeNotification} from "../../actions/notifications.actions";

class HenkilohakuContainer extends React.Component {
    static propTypes = {
        l10n: PropTypes.object.isRequired,
        locale: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);

        this.initialCriteria = this.props.omattiedot.isAdmin
            ? {
                noOrganisation: true,
                subOrganisation: true,
                passivoitu: true,
                dublicates: true,
            }
            : {
                noOrganisation: false,
                subOrganisation: true,
                passivoitu: false,
                dublicates: false,
            };
    };

    componentWillMount() {
        this.props.fetchOmattiedotOrganisaatios();
        this.props.fetchAllKayttooikeusryhma();
        this.props.fetchAllRyhmas();
    }

    render() {
        return (!this.props.omattiedot.omattiedotOrganisaatiosLoading && !this.props.kayttooikeus.allKayttooikeusryhmasLoading && !this.props.ryhmas.ryhmasLoading)
            ? <HenkilohakuPage l10n={this.props.l10n}
                               locale={this.props.locale}
                               initialCriteria={this.initialCriteria}
                               henkilo={this.props.henkilo}
                               kayttooikeusryhmas={this.props.kayttooikeus.allKayttooikeusryhmas}
                               ryhmas={this.props.ryhmas}
                               henkilohakuAction={this.props.henkilohaku}
                               henkilohakuResult={this.props.henkilohakuState.result}
                               henkiloHakuFilters={this.props.henkilohakuState.filters}
                               updateFilters={this.props.updateFilters}
                               henkilohakuLoading={this.props.henkilohakuState.henkilohakuLoading}
                               router={this.props.router}
                               notifications={this.props.notifications}
                               removeNotification={this.props.removeNotification}
                               clearHenkilohaku={this.props.clearHenkilohaku}
                               omattiedot={this.props.omattiedot}/>
            : <Loader />
    };
}

const mapStateToProps = (state, ownProps) => {
    return {
        l10n: state.l10n.localisations,
        locale: state.locale,
        henkilo: state.henkilo,
        kayttooikeus: state.kayttooikeus,
        henkilohakuState: state.henkilohakuState,
        notifications: state.notifications.henkilohakuNotifications,
        omattiedot: state.omattiedot,
        ryhmas: state.ryhmatState
    };
};


export default connect(mapStateToProps, {fetchOmattiedotOrganisaatios, fetchAllKayttooikeusryhma,
    henkilohaku, updateFilters, removeNotification, clearHenkilohaku, fetchAllRyhmas})(HenkilohakuContainer);
