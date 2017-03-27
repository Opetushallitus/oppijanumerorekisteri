import { connect } from 'react-redux';
import { VirkailijaBasicInformation } from '../components/KutsuForm/virkailija-basic-information';
import React from 'react';
import R from 'ramda';


class KutsuFormPage extends React.Component  {

    constructor (props) {
        super(props);
        this.state = {
            confirmationModalOpen: false,
            basicInfo: {
                etunimi: '',
                sukunimi: '',
                email: '',
                languageCode: ''
            }
        };
        console.log(this.props);
    }

    render() {
        // const L = this.props.l10n;
        // const uiLang = this.props.locale;
        // const confirmationProps = {
        //     l10n: L,
        //     locale: uiLang,
        //     basicInfo: this.props.basicInfo,
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
                <VirkailijaBasicInformation l10n={l10n}
                                            basicInfo={basicInfo}>
                </VirkailijaBasicInformation>
                {/*<BasicInfo l10n={L} locale={uiLang} basicInfo={this.props.basicInfo}*/}
                {/*languages={this.props.languages}/>*/}
                {/*<AddToOrganisation l10n={L} uiLang={uiLang} omaOid={this.props.omaOid}*/}
                {/*orgs={this.props.organizationsFlatInHierarchyOrder} addedOrgs={this.props.addedOrgs}/>*/}

                <div className="kutsuFormFooter row">
                    {/*<Button confirm action={this.openConfirmationModal} disabled={!this.isValid()}>*/}
                    {/*{L['VIRKAILIJAN_LISAYS_TALLENNA']}*/}
                    {/*</Button> {this.isAddToOrganizationsNotificationShown() &&*/}
                    {/*<span className="missingInfo">*/}
                    {/*{L['VIRKAILIJAN_LISAYS_VALITSE_VAH_ORGANISAATIO_JA_YKSI_OIKEUS']}*/}
                    {/*</span>}*/}
                </div>
                {/*<KutsuConfirmation {...confirmationProps} />*/}
            </form>
        )
    }

    isValid() {
        return this.isValidEmail(this.props.basicInfo.email)
            && this.props.basicInfo.etunimi && this.props.basicInfo.sukunimi
            && this.isOrganizationsValid();
    }

    isOrganizationsValid() {
        return this.props.addedOrgs.length > 0
            && R.all(org => org.oid && org.selectedPermissions.length > 0)(this.props.addedOrgs)
    }

    isValidEmail(email) {
        return email != null && email.indexOf('@') > 2 && email.indexOf('@') < email.length-3
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
        path: ownProps.location.pathname.substring(1),
        l10n: state.l10n.localisations,
    };
};

export default connect(mapStateToProps)(KutsuFormPage);