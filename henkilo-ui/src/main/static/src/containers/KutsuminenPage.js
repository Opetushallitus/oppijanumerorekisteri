// @flow
import { connect } from 'react-redux';
import BasicInfoForm from '../components/kutsuminen/BasicinfoForm';
import React from 'react';
import KutsuOrganisaatios from '../components/kutsuminen/KutsuOrganisaatios';
import Button from '../components/common/button/Button';
import { fetchOmattiedotOrganisaatios } from '../actions/omattiedot.actions';
import { kutsuAddOrganisaatio } from '../actions/kutsuminen.actions';
import KutsuConfirmation from '../components/kutsuminen/KutsuConfirmation';
import Loader from '../components/common/icons/Loader';
import type {KutsuOrganisaatio} from "../types/domain/kayttooikeus/OrganisaatioHenkilo.types";
import type {Henkilo} from "../types/domain/oppijanumerorekisteri/henkilo.types";
import type {L10n} from "../types/localisation.type";

type Props = {
    fetchOmattiedotOrganisaatios: () => void,
    l10n: L10n,
    locale: string,
    addedOrgs: Array<KutsuOrganisaatio>,
    kutsuAddOrganisaatio: (KutsuOrganisaatio) => void,
    henkilo: Henkilo,
}

type State = {
    confirmationModalOpen: boolean,
    basicInfo: {
        etunimi: string,
        sukunimi: string,
        email: string,
        languageCode: string,
    }
}

class KutsuFormPage extends React.Component<Props, State>  {
    initialBasicInfo: {
        etunimi: string,
        sukunimi: string,
        email: string,
        languageCode: string,
    };

    constructor (props: Props) {
        super(props);
        this.initialBasicInfo = {
            etunimi: '',
            sukunimi: '',
            email: '',
            languageCode: '',
        };

        this.state = {
            confirmationModalOpen: false,
            basicInfo: this.initialBasicInfo,
        };
    }

    componentDidMount() {
        this.props.fetchOmattiedotOrganisaatios();
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
        const {basicInfo} = this.state;

            if (this.props.omattiedotLoading) {
                return (<div className="wrapper"><Loader /></div>);
            }
            else {
                return (
                    <div>
                    <form className="wrapper kutsuFormWrapper">

                        <span>{L['POISTA_MERKKIA']}</span>
                        <BasicInfoForm L={L}
                                    basicInfo={basicInfo}
                                    setBasicInfo={this.setBasicInfo.bind(this)}
                                    locale={this.props.locale}>
                        </BasicInfoForm>
                        <KutsuOrganisaatios L={L}
                                            addedOrgs={this.props.addedOrgs}
                                            henkilo={this.props.henkilo}
                                            locale={this.props.locale}
                                            addOrganisaatio={this.props.kutsuAddOrganisaatio}
                        />

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
        return KutsuFormPage.isValidEmail(email) && etunimi && sukunimi && this.isOrganizationsValid();
    }

    isOrganizationsValid() {
        return this.props.addedOrgs.length > 0
            && this.props.addedOrgs.every(org => org.oid && org.selectedPermissions.length > 0);
    }

    setBasicInfo(basicInfo) {
        this.setState({basicInfo});
    }

    clearBasicInfo() {
        this.setState({ basicInfo: this.initialBasicInfo});
    }

    static isValidEmail(email: string) {
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

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname,
        l10n: state.l10n.localisations,
        omattiedotLoading: state.omattiedot.omattiedotLoading,
        henkilo: state.henkilo,
        addedOrgs: state.kutsuminenOrganisaatios,
        locale: state.locale
    };
};

export default connect(mapStateToProps, {fetchOmattiedotOrganisaatios, kutsuAddOrganisaatio})(KutsuFormPage);
