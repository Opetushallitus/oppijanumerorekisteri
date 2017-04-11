import { connect } from 'react-redux';
import { BasicInfo } from '../components/kutsuminen/BasicinfoForm';
import React from 'react';
import R from 'ramda';
import KutsuOrganisaatios from '../components/kutsuminen/KutsuOrganisaatios';
import locale from '../configuration/locale';
import Button from '../components/common/button/Button';
import { fetchKutsuFormData } from '../actions/omattiedot.actions';
import { kutsuAddOrganisaatio } from '../actions/kutsuminen.actions';
import { browserHistory } from 'react-router';
import KutsuConfirmation from '../components/kutsuminen/KutsuConfirmation';

class KutsuFormPage extends React.Component  {

    constructor () {
        super();
        this.state = {
            confirmationModalOpen: false,
            basicInfo: {
                etunimi: '',
                sukunimi: '',
                email: '',
                languageCode: ''
            }
        };
    }

    componentDidMount() {
        this.props.fetchKutsuFormData();
    }

    render() {
        const L = this.props.l10n[locale];
        const confirmationProps = {
            l10n: this.props.l10n,
            addedOrgs: this.props.addedOrgs,
            modalCloseFn: this.closeConfirmationModal.bind(this),
            modalOpen: this.state.confirmationModalOpen,
            basicInfo: this.state.basicInfo,
            clearBasicInfo: this.clearBasicInfo.bind(this),
            ready: (ok) => ok ? browserHistory.push('/kutsutut') : this.setState({ confirmationModalOpen: false })
        };
        const {l10n} = this.props;
        const {basicInfo} = this.state;

            if(this.props.omattiedot.omattiedotLoading || this.props.henkilo.henkiloOrganisaatiosLoading) {
                return (<h2>Loading</h2>);
            } else {
                return (
                    <form className="kutsuFormWrapper">

                        <span>{this.props.l10n[locale]['POISTA_MERKKIA']}</span>
                        <BasicInfo l10n={l10n}
                                    basicInfo={basicInfo}
                                    setBasicInfo={this.setBasicInfo.bind(this)}>
                        </BasicInfo>
                        <KutsuOrganisaatios l10n={l10n}
                                            omattiedot={this.props.omattiedot.data}
                                            orgs={this.props.henkilo.henkiloOrganisaatios}
                                            addedOrgs={this.props.addedOrgs}
                                            henkilo={this.props.henkilo}
                                            addOrganisaatio={this.props.kutsuAddOrganisaatio}/>

                        <div className="kutsuFormFooter row">
                            <Button confirm action={this.openConfirmationModal.bind(this)} disabled={!this.isValid()}>
                                {L['VIRKAILIJAN_LISAYS_TALLENNA']}
                            </Button> {this.isAddToOrganizationsNotificationShown.bind(this) &&
                            <span className="missingInfo">
                                {L['VIRKAILIJAN_LISAYS_VALITSE_VAH_ORGANISAATIO_JA_YKSI_OIKEUS']}
                            </span>}
                        </div>
                        <KutsuConfirmation {...confirmationProps} />
                    </form>
                )
            }
    }

    isValid() {
        const { email, etunimi, sukunimi } = this.state.basicInfo;
        return this.isValidEmail(email) && etunimi && sukunimi && this.isOrganizationsValid();
    }

    isOrganizationsValid() {
        return this.props.addedOrgs.length > 0
            && R.all(org => org.oid && org.selectedPermissions.length > 0)(this.props.addedOrgs)
    }

    setBasicInfo(basicInfo) {
        this.setState({basicInfo});
    }

    clearBasicInfo() {
        this.setState({ basicInfo: {}});
    }

    isValidEmail(email) {
        return email != null && email.indexOf('@') > 2 && email.indexOf('@') < email.length-3;
    }

    isAddToOrganizationsNotificationShown() {
        return !this.isOrganizationsValid();
    }

    openConfirmationModal(e) {
        e.preventDefault();
        this.setState({
            confirmationModalOpen: true
        })
    }

    closeConfirmationModal(e) {
        e.preventDefault();
        this.setState({
            confirmationModalOpen: false
        })
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname,
        l10n: state.l10n.localisations,
        omattiedot: state.omattiedot,
        henkilo: state.henkilo,
        addedOrgs: state.kutsuminenOrganisaatios
    };
};

export default connect(mapStateToProps, {fetchKutsuFormData, kutsuAddOrganisaatio})(KutsuFormPage);