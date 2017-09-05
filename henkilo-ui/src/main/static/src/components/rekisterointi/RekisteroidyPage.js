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

        this.state = {
            henkilo: {
                etunimet: this.props.kutsu.etunimi,
                sukunimi: this.props.kutsu.sukunimi,
                kutsumanimi: this.props.kutsu.etunimi.split(' ')[0] || '',
                asiointiKieli: {
                    kieliKoodi: this.props.kutsu.asiointikieli,
                },
                kayttajanimi: this.props.kutsu.sahkoposti.split('@')[0] || '',
                password: '',
                passwordAgain: '',
            },
            isValid: false,
        };
    }

    componentWillMount() {
        if(this.props.kutsu.hakaIdentifier) {
            this.createHenkilo();
        }
    }

    render() {
        return <div className="borderless-colored-wrapper rekisteroidy-page">
            <div className="header-borderless">
                <p className="oph-h2 oph-bold">{this.props.L['REKISTEROIDY_OTSIKKO']}</p>
            </div>
            <div className="wrapper">
                <RekisteroidyOrganisaatiot organisaatiot={this.props.kutsu.organisaatiot} />
            </div>
            <div className="flex-horizontal">
                <div className="wrapper flex-item-1">
                    <RekisteroidyPerustiedot henkilo={{henkilo: this.state.henkilo}}
                                             koodisto={this.props.koodisto}
                                             updatePayloadModel={this.updatePayloadModelInput.bind(this)} />
                    <BottomNotificationButton action={this.createHenkilo.bind(this)}
                                              disabled={!this.state.isValid}
                                              id="rekisteroidyPage" >
                        {this.props.L['REKISTEROIDY_TALLENNA_NAPPI']}
                    </BottomNotificationButton>
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
        const henkilo = StaticUtils.updateFieldByDotAnnotation(this.state.henkilo, event);
        this.setState({
            henkilo: henkilo,
            isValid: this.isValid(henkilo),
        });
    }

    isValid(henkilo) {
        const regex = PropertySingleton.getState().specialCharacterRegex;
        return henkilo.etunimet.split(' ').filter(nimi => nimi === henkilo.kutsumanimi)
            && henkilo.kayttajanimi !== ''
            && henkilo.password === henkilo.passwordAgain
            && henkilo.password !== ''
            && henkilo.password.length >= PropertySingleton.getState().minimunPasswordLength
            && regex.exec(henkilo.password) !== null
            && henkilo.asiointiKieli.kieliKoodi !== '';
    }

    createHenkilo() {
        this.props.removeNotification('error', 'buttonNotifications', 'rekisteroidyPage');
        const payload = {...this.state.henkilo};
        this.props.createHenkiloByToken(this.props.kutsu.temporaryToken, payload);
    }

}

export default RekisteroidyPage;
