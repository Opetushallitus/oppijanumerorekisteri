import "./RekisteroidyPage.css"
import React from 'react'
import PropTypes from 'prop-types'
import RekisteroidyPerustiedot from './content/RekisteroidyPerustiedot'
import RekisteroidyOrganisaatiot from "./content/RekisteroidyOrganisaatiot";
import StaticUtils from "../common/StaticUtils";
import PropertySingleton from "../../globals/PropertySingleton"
import RekisteroidyHaka from "./content/RekisteroidyHaka";
import Modal from "../common/modal/Modal";
import LoadingBarTimer from "../common/loadingbar/LoadingBarTimer";
import BottomNotificationButton from "../common/button/BottomNotificationButton";

class RekisteroidyPage extends React.Component {
    static propTypes = {
        koodisto: PropTypes.shape({
            kieli: PropTypes.array.isRequired,
        }).isRequired,
        kutsu: PropTypes.shape({
            temporaryToken: PropTypes.string.isRequired,
            etunimi: PropTypes.string.isRequired,
            sukunimi: PropTypes.string.isRequired,
            asiointikieli: PropTypes.string.isRequired,
            hakaIdentifier: PropTypes.string,
        }).isRequired,
        createHenkiloByToken: PropTypes.func.isRequired,
        removeNotification: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.errorChecks = [
            (henkilo) => !this.etunimetContainsKutsumanimi(henkilo) ? props.L['REKISTEROIDY_ERROR_KUTSUMANIMI'] : null,
            (henkilo) => !this.kayttajanimiIsNotEmpty(henkilo) ? props.L['REKISTEROIDY_ERROR_KAYTTAJANIMI'] : null,
            (henkilo) => !this.passwordsAreSame(henkilo) ? props.L['REKISTEROIDY_ERROR_PASSWORD_MATCH'] : null,
            (henkilo) => !this.passwordExceedsMinLength(henkilo) ? props.L['REKISTEROIDY_ERROR_PASSWORD_LENGTH'].replace('%s', PropertySingleton.getState().minimunPasswordLength) : null,
            (henkilo) => !this.passwordHasSpecialCharacter(henkilo) ? props.L['REKISTEROIDY_ERROR_PASSWORD_SPECIALCHARACTER'] : null,
            (henkilo) => !this.kielikoodiIsNotEmpty(henkilo) ? props.L['REKISTEROIDY_ERROR_KIELIKOODI'] : null,
        ];

        this.state = {
            henkilo: {
                etunimet: this.props.kutsu.etunimi,
                sukunimi: this.props.kutsu.sukunimi,
                kutsumanimi: this.props.kutsu.etunimi.split(' ')[0] || '',
                asiointiKieli: {
                    kieliKoodi: this.props.kutsu.asiointikieli,
                },
                kayttajanimi: this.createDefaultUsername(),
                password: '',
                passwordAgain: '',
            },
            isValid: false,
        }
    }

    componentDidMount() {
        if (this.props.kutsu.hakaIdentifier) {
            this.createHenkilo();
        }
    }

    componentWillReceiveProps(nextProps) {

    }

    render() {
        return <div className="borderless-colored-wrapper rekisteroidy-page" style={{marginTop: "50px"}}>
            <div className="header-borderless">
                <p className="oph-h2 oph-bold">{this.props.L['REKISTEROIDY_OTSIKKO']}</p>
            </div>
            <div className="wrapper">
                <RekisteroidyOrganisaatiot organisaatiot={this.props.kutsu.organisaatiot} L={this.props.L} locale={this.props.locale} />
            </div>
            <div className="flex-horizontal">
                <div className="wrapper flex-item-1">
                    <RekisteroidyPerustiedot
                        henkilo={{henkilo: this.state.henkilo}}
                        koodisto={this.props.koodisto}
                        updatePayloadModel={this.updatePayloadModelInput.bind(this)}
                        isLanguageError={!this.kielikoodiIsNotEmpty(this.state.henkilo)}
                        isPasswordError={this.isPasswordError()}
                        isUsernameError={!this.kayttajanimiIsNotEmpty(this.state.henkilo)}
                        isKutsumanimiError={!this.etunimetContainsKutsumanimi(this.state.henkilo)}
                    />
                    <BottomNotificationButton action={this.createHenkilo.bind(this)}
                                              disabled={!this.state.isValid}
                                              id="rekisteroidyPage" >
                        {this.props.L['REKISTEROIDY_TALLENNA_NAPPI']}
                    </BottomNotificationButton>
                    <div>
                        {this.printErrors()}
                    </div>
                </div>
                <div className="borderless-colored-wrapper flex-horizontal flex-align-center">
                    <span className="oph-h3 oph-bold">{this.props.L['REKISTEROIDY_VALITSE']}</span>
                </div>
                <div className="wrapper flex-item-1">
                    <RekisteroidyHaka henkilo={{henkilo: this.state.henkilo}}
                                      koodisto={this.props.koodisto}
                                      updatePayloadModel={this.updatePayloadModelInput.bind(this)}
                                      temporaryKutsuToken={this.props.kutsu.temporaryToken}
                    />
                </div>
            </div>
            <Modal show={this.props.authToken !== ''} closeOnOuterClick={false} onClose={() => {}}>
                <div className="rekisteroidy-modal">
                    <p className="oph-h3 oph-bold">{this.props.L['REKISTEROIDY_ODOTTAA_SYNKRONOINTIA_OTSIKKO']}</p>
                    <p className="oph-h6 oph-bold">{this.props.L['REKISTEROIDY_ODOTTAA_SYNKRONOINTIA_TEKSTI']}</p>
                    <LoadingBarTimer timeInSeconds={60} restartAfterFinished={true} />
                </div>
            </Modal>
        </div>;
    }

    updatePayloadModelInput(event) {
        const henkilo = StaticUtils.updateFieldByDotAnnotation({...this.state.henkilo}, event) || this.state.henkilo;
        this.setState({
            henkilo: henkilo,
            isValid: this.isValid(henkilo),
        });
    }

    createDefaultUsername() {
        const email = this.props.kutsu.sahkoposti;
        return (email
            && email.split('@')[0]
            && email.split('@')[0].replace(/[^A-Za-z0-9]/g, ''))
            || '';
    }

    isValid(henkilo) {
        return this.etunimetContainsKutsumanimi(henkilo)
            && this.kayttajanimiIsNotEmpty(henkilo)
            && this.passwordsAreSame(henkilo)
            && this.passwordExceedsMinLength(henkilo)
            && this.passwordHasSpecialCharacter(henkilo)
            && this.kielikoodiIsNotEmpty(henkilo);
    }

    createHenkilo() {
        this.props.removeNotification('error', 'buttonNotifications', 'rekisteroidyPage');
        const payload = {...this.state.henkilo};
        this.props.createHenkiloByToken(this.props.kutsu.temporaryToken, payload);
    }

    etunimetContainsKutsumanimi(henkilo) {
        return henkilo.etunimet.split(' ').filter(nimi => nimi === henkilo.kutsumanimi).length;
    }

    passwordIsNotEmpty(henkilo) {
        return StaticUtils.stringIsNotEmpty(henkilo.password);
    }

    passwordExceedsMinLength(henkilo) {
        return this.passwordIsNotEmpty(henkilo)
            && henkilo.password.length >= PropertySingleton.getState().minimunPasswordLength;
    }

    passwordHasSpecialCharacter(henkilo) {
        return (PropertySingleton.getState().specialCharacterRegex.exec(henkilo.password)) !== null;
    }

    passwordsAreSame(henkilo) {
        return henkilo.password === henkilo.passwordAgain;
    }

    kielikoodiIsNotEmpty(henkilo) {
        return StaticUtils.stringIsNotEmpty(henkilo.asiointiKieli.kieliKoodi);
    }

    kayttajanimiIsNotEmpty(henkilo) {
        return StaticUtils.stringIsNotEmpty(henkilo.kayttajanimi);
    }

    printErrors() {
        return this.errorChecks.map((errorCheck, idx) => {
            const errorMessage = errorCheck(this.state.henkilo);
            return errorMessage ? <ul key={idx} className="oph-h5 oph-red">! {errorMessage}</ul> : null;
        });
    }

    isPasswordError() {
        return !this.passwordIsNotEmpty(this.state.henkilo)
            || !this.passwordHasSpecialCharacter(this.state.henkilo)
            || !this.passwordExceedsMinLength(this.state.henkilo)
            || !this.passwordsAreSame(this.state.henkilo);
    }

}

export default RekisteroidyPage;
