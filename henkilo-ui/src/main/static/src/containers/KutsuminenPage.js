import { connect } from 'react-redux';
import { BasicInfo } from '../components/kutsuminen/BasicinfoForm';
import React from 'react';
import R from 'ramda';
import KutsuOrganisaatios from '../components/kutsuminen/KutsuOrganisaatios';
import Button from '../components/common/button/Button';
import { fetchHenkiloOrganisaatiosForCurrentUser } from '../actions/omattiedot.actions';
import { kutsuAddOrganisaatio } from '../actions/kutsuminen.actions';
import KutsuConfirmation from '../components/kutsuminen/KutsuConfirmation';
import Loader from '../components/common/icons/Loader';

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
        this.props.fetchHenkiloOrganisaatiosForCurrentUser();
    }

    render() {
        const L = this.props.l10n[this.props.locale];
        const confirmationProps = {
            l10n: this.props.l10n,
            locale: this.props.locale,
            addedOrgs: this.props.addedOrgs,
            modalCloseFn: this.closeConfirmationModal.bind(this),
            modalOpen: this.state.confirmationModalOpen,
            basicInfo: this.state.basicInfo,
            clearBasicInfo: this.clearBasicInfo.bind(this),
        };
        const {l10n} = this.props;
        const {basicInfo} = this.state;

            if(this.props.omattiedot.omattiedotLoading || this.props.henkilo.henkiloOrganisaatiosLoading) {
                return (<div className="wrapper"><Loader /></div>);
            } else {
                return (
                    <div>
                    <form className="wrapper kutsuFormWrapper">

                        <span>{this.props.l10n[this.props.locale]['POISTA_MERKKIA']}</span>
                        <BasicInfo l10n={l10n}
                                    basicInfo={basicInfo}
                                    setBasicInfo={this.setBasicInfo.bind(this)}
                                    locale={this.props.locale}>
                        </BasicInfo>
                        <KutsuOrganisaatios l10n={l10n}
                                            omattiedot={this.props.omattiedot.data}
                                            orgs={this.props.henkilo.henkiloOrganisaatios}
                                            addedOrgs={this.props.addedOrgs}
                                            henkilo={this.props.henkilo}
                                            locale={this.props.locale}
                                            addOrganisaatio={this.props.kutsuAddOrganisaatio}/>

                        <div className="kutsuFormFooter row">
                            <Button action={this.openConfirmationModal.bind(this)} disabled={!this.isValid()}>
                                {L['VIRKAILIJAN_LISAYS_TALLENNA']}
                            </Button> {this.isAddToOrganizationsNotificationShown.bind(this) &&

                        <span className="missingInfo">
                                {L['VIRKAILIJAN_LISAYS_VALITSE_VAH_ORGANISAATIO_JA_YKSI_OIKEUS']}
                            </span>}
                        </div>
                        <KutsuConfirmation {...confirmationProps} />
                    </form>
                </div>
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
        return email !== null && email.indexOf('@') > 2 && email.indexOf('@') < email.length-3;
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

const mapDispatchToProps = (dispatch) => {
    return {
        fetchHenkiloOrganisaatiosForCurrentUser: () => dispatch(fetchHenkiloOrganisaatiosForCurrentUser()),
        kutsuAddOrganisaatio: (organisaatio) => dispatch(kutsuAddOrganisaatio(organisaatio))
    }
};

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname,
        l10n: state.l10n.localisations,
        omattiedot: state.omattiedot,
        henkilo: state.henkilo,
        addedOrgs: state.kutsuminenOrganisaatios,
        locale: state.locale
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(KutsuFormPage);
