import './RekisteroidyPage.css';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import RekisteroidyPerustiedot from './content/RekisteroidyPerustiedot';
import RekisteroidyOrganisaatiot from './content/RekisteroidyOrganisaatiot';
import StaticUtils from '../common/StaticUtils';
import RekisteroidyHaka from './content/RekisteroidyHaka';
import BottomNotificationButton from '../common/button/BottomNotificationButton';
import { isValidPassword } from '../../validation/PasswordValidator';
import type { KutsuOrganisaatio } from '../../types/domain/kayttooikeus/Kutsu.types';

type Props = {
    koodisto: {
        kieli: Array<any>;
    };
    kutsu: {
        temporaryToken: string;
        etunimi: string;
        sukunimi: string;
        asiointikieli: string;
        hakaIdentifier?: string;
        organisaatiot: KutsuOrganisaatio[];
    };
    createHenkiloByToken: (temporaryToken: string, payload: any) => any;
    removeNotification: (status: string, group: string, id: string) => any;
    L: Record<string, string>;
    locale: string;
};

type Henkilo = {
    etunimet: string;
    sukunimi: string;
    kutsumanimi: string;
    asiointiKieli: {
        kieliKoodi: string;
    };
    kayttajanimi: string;
    password: string;
    passwordAgain: string;
};

type State = {
    henkilo: Henkilo;
    isValid: boolean;
    privacyPolicySeen: boolean;
};

class RekisteroidyPage extends React.Component<Props, State> {
    errorChecks;

    constructor(props) {
        super(props);

        this.errorChecks = [
            (henkilo) =>
                !this.etunimetContainsKutsumanimi(henkilo) ? props.L['REKISTEROIDY_ERROR_KUTSUMANIMI'] : null,
            (henkilo) => (!this.kayttajanimiIsNotEmpty(henkilo) ? props.L['REKISTEROIDY_ERROR_KAYTTAJANIMI'] : null),
            (henkilo) => (!this.passwordsAreSame(henkilo) ? props.L['REKISTEROIDY_ERROR_PASSWORD_MATCH'] : null),
            (henkilo) => (!isValidPassword(henkilo.password) ? props.L['REKISTEROIDY_ERROR_PASSWORD_INVALID'] : null),
            (henkilo) => (!this.kielikoodiIsNotEmpty(henkilo) ? props.L['REKISTEROIDY_ERROR_KIELIKOODI'] : null),
        ];

        this.state = {
            henkilo: {
                etunimet: this.props.kutsu.etunimi,
                sukunimi: this.props.kutsu.sukunimi,
                kutsumanimi: this.props.kutsu.etunimi.split(' ')[0] || '',
                asiointiKieli: {
                    kieliKoodi: this.props.kutsu.asiointikieli,
                },
                kayttajanimi: '',
                password: '',
                passwordAgain: '',
            },
            isValid: false,
            privacyPolicySeen: false,
        };
    }

    componentDidMount() {
        if (this.props.kutsu.hakaIdentifier) {
            this.createHenkilo();
        }
    }

    showForm() {
        return (
            <div>
                <div className="wrapper">
                    <RekisteroidyOrganisaatiot
                        organisaatiot={this.props.kutsu.organisaatiot}
                        L={this.props.L}
                        locale={this.props.locale}
                    />
                </div>
                <div className="flex-horizontal">
                    <div className="wrapper flex-item-1">
                        <RekisteroidyPerustiedot
                            henkilo={{ henkilo: this.state.henkilo }}
                            koodisto={this.props.koodisto}
                            updatePayloadModel={this.updatePayloadModelInput.bind(this)}
                            isLanguageError={!this.kielikoodiIsNotEmpty(this.state.henkilo)}
                            isPasswordError={this.isPasswordError()}
                            isUsernameError={!this.kayttajanimiIsNotEmpty(this.state.henkilo)}
                            isKutsumanimiError={!this.etunimetContainsKutsumanimi(this.state.henkilo)}
                        />
                        <BottomNotificationButton
                            action={this.createHenkilo.bind(this)}
                            disabled={!this.state.isValid}
                            id="rekisteroidyPage"
                        >
                            {this.props.L['REKISTEROIDY_TALLENNA_NAPPI']}
                        </BottomNotificationButton>
                        <div>{this.printErrors()}</div>
                    </div>
                    <div className="borderless-colored-wrapper flex-horizontal flex-align-center">
                        <span className="oph-h3 oph-bold">{this.props.L['REKISTEROIDY_VALITSE']}</span>
                    </div>
                    <div className="wrapper flex-item-1">
                        <RekisteroidyHaka
                            henkilo={{ henkilo: this.state.henkilo }}
                            koodisto={this.props.koodisto}
                            updatePayloadModel={this.updatePayloadModelInput.bind(this)}
                            temporaryKutsuToken={this.props.kutsu.temporaryToken}
                        />
                    </div>
                </div>
            </div>
        );
    }

    showPrivacyPolicy() {
        return (
            <div className="wrapper">
                <div className="rekisteroidy-organisaatiot-wrapper" style={{ marginBottom: '2em' }}>
                    <ReactMarkdown linkTarget="_blank" className="privacy-policy">
                        {this.props.L['REKISTEROIDY_PRIVACY_POLICY']}
                    </ReactMarkdown>
                </div>
                <BottomNotificationButton
                    action={() => this.setState({ privacyPolicySeen: true })}
                    id="rekisteroidyPage"
                >
                    {this.props.L['REKISTEROIDY_ACCEPT_PRIVACY_POLICY']}
                </BottomNotificationButton>
            </div>
        );
    }

    render() {
        return (
            <div className="borderless-colored-wrapper rekisteroidy-page" style={{ marginTop: '50px' }}>
                <div className="header-borderless">
                    <p className="oph-h2 oph-bold">{this.props.L['REKISTEROIDY_OTSIKKO']}</p>
                </div>
                {this.state.privacyPolicySeen ? this.showForm() : this.showPrivacyPolicy()}
            </div>
        );
    }

    updatePayloadModelInput(event) {
        const henkilo = StaticUtils.updateFieldByDotAnnotation({ ...this.state.henkilo }, event) || this.state.henkilo;
        this.setState({
            henkilo: henkilo,
            isValid: this.isValid(henkilo),
        });
    }

    isValid(henkilo) {
        return (
            this.etunimetContainsKutsumanimi(henkilo) &&
            this.kayttajanimiIsNotEmpty(henkilo) &&
            this.passwordsAreSame(henkilo) &&
            isValidPassword(henkilo.password) &&
            this.kielikoodiIsNotEmpty(henkilo)
        );
    }

    createHenkilo() {
        this.props.removeNotification('error', 'buttonNotifications', 'rekisteroidyPage');
        const payload = { ...this.state.henkilo };
        this.props.createHenkiloByToken(this.props.kutsu.temporaryToken, payload);
    }

    etunimetContainsKutsumanimi(henkilo) {
        return henkilo.etunimet.split(' ').filter((nimi) => nimi === henkilo.kutsumanimi).length;
    }

    passwordIsNotEmpty(henkilo) {
        return StaticUtils.stringIsNotEmpty(henkilo.password);
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
            return errorMessage ? (
                <ul key={idx} className="oph-h5 oph-red">
                    ! {errorMessage}
                </ul>
            ) : null;
        });
    }

    isPasswordError() {
        return (
            !this.passwordIsNotEmpty(this.state.henkilo) ||
            !isValidPassword(this.state.henkilo.password) ||
            !this.passwordsAreSame(this.state.henkilo)
        );
    }
}

export default RekisteroidyPage;
