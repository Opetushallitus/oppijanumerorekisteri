import { connect } from 'react-redux';
import { VirkailijaBasicInformation } from '../components/KutsuForm/virkailija-basic-information';
import React from 'react';
// import R from 'ramda';
import AddToOrganization from '../components/KutsuForm/AddToOrganization';
import locale from '../configuration/locale';
import Button from '../components/common/button/Button';
import { fetchKutsuFormData } from '../actions/omattiedot.actions';

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
        // const uiLang = this.props.locale;
        // const confirmationProps = {
        //     addedOrgs: this.props.addedOrgs,
        //     modalCloseFn: this.closeConfirmationModal,
        //     modalOpen: this.state.confirmationModalOpen,
        //     ready:(ok) => ok ? navigateTo('/kutsu/list', 'VIRKAILIJAN_LISAYS_LAHETETTY') : this.setState({
        //             confirmationModalOpen: false
        //         })
        // };
        const {l10n} = this.props;
        const {basicInfo} = this.state;
        return (
            <form className="kutsuFormWrapper">
                <h1>{this.state.basicInfo.email}</h1>
                <VirkailijaBasicInformation l10n={l10n}
                                            basicInfo={basicInfo}
                                            setBasicInfo={this.setBasicInfo.bind(this)}>
                </VirkailijaBasicInformation>

                <AddToOrganization l10n={l10n}
                                   omaOid={this.props.omaOid}
                                   orgs={this.props.organizationsFlatInHierarchyOrder}
                                   addedOrgs={this.props.addedOrgs}/>

                <div className="kutsuFormFooter row">
                    <Button confirm action={this.openConfirmationModal} disabled={!this.isValid()}>
                    {L['VIRKAILIJAN_LISAYS_TALLENNA']}
                    </Button> {this.isAddToOrganizationsNotificationShown() &&
                    <span className="missingInfo">
                    {L['VIRKAILIJAN_LISAYS_VALITSE_VAH_ORGANISAATIO_JA_YKSI_OIKEUS']}
                    </span>}
                </div>
                {/*<KutsuConfirmation {...confirmationProps} />*/}
            </form>
        )
    }

    isValid() {
        const { email, etunimi, sukunimi } = this.state.basicInfo;
        return this.isValidEmail(email) && etunimi && sukunimi && this.isOrganizationsValid();
    }

    isOrganizationsValid() {
        // return this.props.addedOrgs.length > 0
        //     && R.all(org => org.oid && org.selectedPermissions.length > 0)(this.props.addedOrgs)
    }

    setBasicInfo(basicInfo) {
        this.setState({basicInfo});
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
        henkilo: state.henkilo
    };
};

export default connect(mapStateToProps, {fetchKutsuFormData})(KutsuFormPage);