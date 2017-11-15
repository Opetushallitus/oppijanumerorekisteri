// @flow
import { connect } from 'react-redux';
import BasicInfoForm from '../components/kutsuminen/BasicinfoForm';
import React from 'react';
import KutsuOrganisaatios from '../components/kutsuminen/KutsuOrganisaatios';
import { fetchOmattiedotOrganisaatios } from '../actions/omattiedot.actions';
import { kutsuAddOrganisaatio } from '../actions/kutsuminen.actions';
import KutsuConfirmation from '../components/kutsuminen/KutsuConfirmation';
import Loader from '../components/common/icons/Loader';
import type {KutsuOrganisaatio} from "../types/domain/kayttooikeus/OrganisaatioHenkilo.types";
import type {Henkilo} from "../types/domain/oppijanumerorekisteri/henkilo.types";
import type {L, L10n} from "../types/localisation.type";
import ValidationMessageButton from "../components/common/button/ValidationMessageButton";
import type {ValidationMessage} from "../types/validation.type";
import type {BasicinfoType} from "../components/kutsuminen/BasicinfoForm";
import StaticUtils from "../components/common/StaticUtils";

type Props = {
    fetchOmattiedotOrganisaatios: () => void,
    L: L,
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
    },
    validationMessages: {organisaatioKayttooikeus: ValidationMessage, allFilled: ValidationMessage},
}

class KutsuFormPage extends React.Component<Props, State>  {
    initialBasicInfo: {
        etunimi: string,
        sukunimi: string,
        email: string,
        languageCode: string,
    };

    initialValidationMessages: {organisaatioKayttooikeus: ValidationMessage, allFilled: ValidationMessage};

    constructor (props: Props) {
        super(props);
        this.initialBasicInfo = {
            etunimi: '',
            sukunimi: '',
            email: '',
            languageCode: '',
        };

        this.initialValidationMessages = {
            organisaatioKayttooikeus: {
                id: 'organisaatioKayttooikeus',
                labelLocalised: this.props.L['VIRKAILIJAN_LISAYS_VALITSE_VAH_ORGANISAATIO_JA_YKSI_OIKEUS'],
                isValid: false,
            },
            allFilled: {
                id: 'allFilled',
                labelLocalised: this.props.L['VIRKAILIJAN_LISAYS_TAYTA_KAIKKI_KENTAT'],
                isValid: false,
            },
        };

        this.state = {
            confirmationModalOpen: false,
            basicInfo: {...this.initialBasicInfo},
            validationMessages: {...this.initialValidationMessages},
        };
    }

    componentDidMount() {
        this.props.fetchOmattiedotOrganisaatios();
    }

    componentWillReceiveProps(nextProps: Props) {
        this.updateOrganisaatioValidation(nextProps.addedOrgs);
    }

    render() {
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

                        <span>{this.props.L['POISTA_MERKKIA']}</span>
                        <BasicInfoForm L={this.props.L}
                                       basicInfo={basicInfo}
                                       setBasicInfo={this.setBasicInfo.bind(this)}
                                       locale={this.props.locale}>
                        </BasicInfoForm>
                        <KutsuOrganisaatios L={this.props.L}
                                            addedOrgs={this.props.addedOrgs}
                                            henkilo={this.props.henkilo}
                                            locale={this.props.locale}
                                            addOrganisaatio={this.props.kutsuAddOrganisaatio}
                        />

                        <div className="kutsuFormFooter row">
                            <ValidationMessageButton buttonAction={this.openConfirmationModal.bind(this)}
                                                     validationMessages={this.state.validationMessages}>
                                {this.props.L['VIRKAILIJAN_LISAYS_TALLENNA']}
                            </ValidationMessageButton>
                        </div>
                        <KutsuConfirmation {...confirmationProps} />
                    </form>
                </div>
            )
        }
    }

    static isValid(basicInfo: BasicinfoType): boolean {
        const { email, etunimi, sukunimi, languageCode } = basicInfo;
        return KutsuFormPage.isValidEmail(email) && !!etunimi && !!sukunimi && !!languageCode;
    }

    isOrganizationsValid(newAddedOrgs): boolean {
        return newAddedOrgs.length > 0
            && newAddedOrgs
                .every(org => StaticUtils.stringIsNotEmpty(org.oid) && org.selectedPermissions.length > 0);
    }

    setBasicInfo(basicInfo) {
        this.setState({
            basicInfo,
            validationMessages: {
                ...this.state.validationMessages,
                allFilled: {
                    ...this.state.validationMessages.allFilled,
                    isValid: KutsuFormPage.isValid(basicInfo),
                },
            },
        });
    }

    updateOrganisaatioValidation(newAddedOrgs) {
        this.setState({
            validationMessages: {
                ...this.state.validationMessages,
                organisaatioKayttooikeus: {
                    ...this.state.validationMessages.organisaatioKayttooikeus,
                    isValid: this.isOrganizationsValid(newAddedOrgs),
                },
            },
        });
    }

    clearBasicInfo() {
        this.setBasicInfo({...this.initialBasicInfo});
    }

    static isValidEmail(email: string): boolean {
        return email !== null && email.indexOf('@') > 2 && email.indexOf('@') < email.length-3;
    }

    openConfirmationModal(e: Event) {
        e.preventDefault();
        this.setState({
            confirmationModalOpen: true,
        })
    }

    closeConfirmationModal(e: Event) {
        e.preventDefault();
        this.setState({
            confirmationModalOpen: false,
        })
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname,
        l10n: state.l10n.localisations,
        L: state.l10n.localisations[state.locale],
        omattiedotLoading: state.omattiedot.omattiedotLoading,
        henkilo: state.henkilo,
        addedOrgs: state.kutsuminenOrganisaatios,
        locale: state.locale
    };
};

export default connect(mapStateToProps, {fetchOmattiedotOrganisaatios, kutsuAddOrganisaatio})(KutsuFormPage);
