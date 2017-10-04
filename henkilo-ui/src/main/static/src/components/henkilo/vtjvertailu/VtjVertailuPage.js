import React from 'react';
import {connect} from 'react-redux';
import {
    fetchHenkilo,
    fetchHenkiloYksilointitieto,
    fetchHenkiloSlaves,
    overrideHenkiloVtjData
} from "../../../actions/henkilo.actions";
import VtjVertailuListaus from './VtjVertailuListaus';
import Loader from "../../common/icons/Loader";
import {updateHenkiloNavigation} from "../../../actions/navigation.actions";
import Button from "../../common/button/Button";
import {henkiloViewTabs} from "../../NavigationTabs";
import WideGreenNotification from "../../common/notifications/WideGreenNotification";
import WideRedNotification from "../../common/notifications/WideRedNotification";

class VtjVertailuPage extends React.Component {

    constructor() {
        super();
        this.state = {
            showSuccess: false,
            showError: false
        }
    }

    async componentDidMount() {
        this.props.fetchHenkilo(this.props.oidHenkilo);
        this.props.fetchHenkiloYksilointitieto(this.props.oidHenkilo);
        this.props.fetchHenkiloSlaves(this.props.oidHenkilo); // tabs need data about master to switch duplicates tab enabled
    }

    componentWillReceiveProps(nextProps) {
        const tabs = henkiloViewTabs(this.props.oidHenkilo, nextProps.henkilo, nextProps.henkiloType);
        this.props.updateHenkiloNavigation(tabs);
    }

    render() {
        return this.props.henkilo.yksilointitiedotLoading || this.props.henkilo.henkiloLoading ? <Loader/> :
            <div className="wrapper">
                <h1>{this.props.L['HENKILO_VTJ_VERTAILU']}</h1>
                {this.state.showSuccess ? <WideGreenNotification message={this.props.L['HENKILO_VTJ_YLIAJA_SUCCESS']} closeAction={this.hideSuccess.bind(this)}></WideGreenNotification> : null }
                {this.state.showError ? <WideRedNotification message={this.props.L['HENKILO_VTJ_YLIAJA_FAILURE']} closeAction={this.hideError.bind(this)}></WideRedNotification> : null}
                <VtjVertailuListaus henkilo={this.props.henkilo} L={this.props.L}></VtjVertailuListaus>
                <Button
                    action={this.overrideHenkiloInformation.bind(this)}>{this.props.L['HENKILO_VTJ_YLIAJA']}</Button>
            </div>;
    }

    async overrideHenkiloInformation() {
        try {
            await this.props.overrideHenkiloVtjData(this.props.oidHenkilo);
            this.showSuccess();
        } catch (error) {
            this.showError();
            throw error;
        }
    }

    showError() {
        this.setState({showError: true});
    }
    
    hideError() {
        this.setState({showError: false});
    }

    showSuccess() {
        this.setState({showSuccess: true});
    }

    hideSuccess() {
        this.setState({showSuccess: false});
    }


}

const mapStateToProps = (state, ownProps) => {
    return {
        oidHenkilo: ownProps.params['oid'],
        henkiloType: ownProps.params['henkiloType'],
        henkilo: state.henkilo,
        L: state.l10n.localisations[state.locale]
    }
};

export default connect(mapStateToProps, {
    fetchHenkilo,
    fetchHenkiloYksilointitieto,
    updateHenkiloNavigation,
    overrideHenkiloVtjData,
    fetchHenkiloSlaves
})(VtjVertailuPage);