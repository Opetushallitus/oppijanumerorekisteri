import React from 'react';
import { RouteActions } from 'react-router-redux';
import { clone, remove } from 'ramda';
import { urls } from 'oph-urls-js';

import { Locale } from '../../types/locale.type';
import { Localisations } from '../../types/localisation.type';
import { Henkilo } from '../../types/domain/oppijanumerorekisteri/henkilo.types';
import { http } from '../../http';
import Button from '../../components/common/button/Button';
import { YhteystietoRyhma } from '../../types/domain/oppijanumerorekisteri/yhteystietoryhma.types';
import { EmailVerificationList } from './EmailVerificationList';
import {
    notEmptyYhteystiedotRyhmaEmailCount,
    validateYhteystiedotRyhmaEmails,
} from '../../utilities/yhteystietoryhma.util';
import { Yhteystieto } from '../../types/domain/oppijanumerorekisteri/yhteystieto.types';
import PropertySingleton from '../../globals/PropertySingleton';
import { WORK_ADDRESS, EMAIL } from '../../types/constants';
import { toSupportedLocale } from '../../reducers/locale.reducer';

type Props = {
    locale: Locale;
    L: Localisations;
    henkilo: Partial<Henkilo>;
    loginToken: string;
    router: RouteActions;
    errorNotification: (title: string) => void;
};

type State = {
    validForm: boolean;
    henkilo: Partial<Henkilo>;
    emailFieldCount: number;
};

/*
 * Virkailijan sähköpostin varmentamisen käyttöliittymä
 */
export class EmailVerificationPage extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            validForm: props.henkilo.yhteystiedotRyhma
                ? validateYhteystiedotRyhmaEmails(props.henkilo.yhteystiedotRyhma)
                : false,
            henkilo: props.henkilo,
            emailFieldCount: notEmptyYhteystiedotRyhmaEmailCount(props.henkilo.yhteystiedotRyhma),
        };
    }

    componentDidMount() {
        // Lisätään käyttäjän yhteystietoihin tyhjä sähköpostiosoite, jos sellaista ei löydy
        if (this.state.emailFieldCount === 0) {
            const yhteystiedotRyhma = clone(this.state.henkilo.yhteystiedotRyhma);
            const emptyEmailYhteystieto: Yhteystieto = {
                yhteystietoTyyppi: EMAIL,
                yhteystietoArvo: '',
            };

            // Jos käyttäjällä ei ole yhteystietoryhmiä ollenkaan, tai jos käyttäjällä on vain muita kuin sähköpostiyhteystietoja
            // niin lisätään uusi tyhjä yhteystietoryhmä ja tyhjä sähköposti-yhteystieto
            if (
                this.state.henkilo.yhteystiedotRyhma.length === 0 ||
                this.state.henkilo.yhteystiedotRyhma[0].yhteystieto.length >= 1
            ) {
                const yhteystietoRyhma: YhteystietoRyhma = {
                    ryhmaAlkuperaTieto: PropertySingleton.state.YHTEYSTIETO_ALKUPERA_VIRKAILIJA_UI,
                    ryhmaKuvaus: WORK_ADDRESS,
                    yhteystieto: [emptyEmailYhteystieto],
                };

                yhteystiedotRyhma.push(yhteystietoRyhma);
            } else if (this.state.henkilo.yhteystiedotRyhma[0].yhteystieto.length === 0) {
                // Jos käyttäjällä on tyhjä yhteystietoryhmä, lisätään tyhjä sähköpostiosoite
                yhteystiedotRyhma[0].yhteystieto.push(emptyEmailYhteystieto);
            }

            this.setState({ henkilo: { ...this.state.henkilo, yhteystiedotRyhma } });
        }
    }

    render() {
        return (
            <div className="infoPageWrapper" id="email-verification-page">
                <h2 className="oph-h2 oph-bold">{this.props.L['SAHKOPOSTI_VARMENNUS_OTSIKKO']}</h2>
                <p style={{ textAlign: 'left' }}>
                    {
                        this.props.L[
                            this.state.emailFieldCount > 0
                                ? 'SAHKOPOSTI_VARMENNUS_OHJE'
                                : 'SAHKOPOSTI_VARMENNUS_EI_OSOITTEITA'
                        ]
                    }
                </p>
                <EmailVerificationList
                    yhteystiedotRyhma={this.state.henkilo.yhteystiedotRyhma}
                    onEmailChange={this.emailChangeEvent.bind(this)}
                    onEmailRemove={this.onEmailRemove.bind(this)}
                    L={this.props.L}
                    emailFieldCount={this.state.emailFieldCount}
                ></EmailVerificationList>

                <div style={{ textAlign: 'center' }}>
                    <Button action={this.verifyEmailAddresses.bind(this)} isButton disabled={!this.state.validForm} big>
                        {this.props.L['SAHKOPOSTI_VARMENNUS_JATKA']}
                    </Button>
                </div>
            </div>
        );
    }

    async verifyEmailAddresses() {
        const locale = toSupportedLocale(this.props.locale);
        const loginTokenValidationCodeUrl = urls.url(
            'kayttooikeus-service.cas.emailverification.loginToken.validation',
            this.props.loginToken
        );
        const loginTokenValidationCode = await http.get(loginTokenValidationCodeUrl);
        if (loginTokenValidationCode !== 'TOKEN_OK') {
            this.props.router.push(
                `/sahkopostivarmistus/virhe/${locale}/${this.props.loginToken}/${loginTokenValidationCode}`
            );
        } else {
            const emailVerificationUrl = urls.url('kayttooikeus-service.cas.emailverification', this.props.loginToken);
            await http.post(emailVerificationUrl, this.state.henkilo).catch((error) => {
                this.props.errorNotification(this.props.L['REKISTEROIDY_ILLEGALARGUMENT_OTSIKKO']);
                throw error;
            });
            this.props.router.push(`/kayttaja/sahkopostivarmistus/valmis/${locale}`);
        }
    }

    emailChangeEvent(yhteystiedotRyhmaIndex: number, yhteystietoIndex: number, value: string): void {
        const yhteystiedotRyhma: Array<YhteystietoRyhma> = this.state.henkilo.yhteystiedotRyhma;
        yhteystiedotRyhma[yhteystiedotRyhmaIndex].yhteystieto[yhteystietoIndex].yhteystietoArvo = value;
        const validForm = validateYhteystiedotRyhmaEmails(yhteystiedotRyhma);
        this.setState({
            henkilo: { ...this.state.henkilo, yhteystiedotRyhma },
            validForm,
        });
    }

    onEmailRemove(yhteystiedotRyhmaIndex: number, yhteystietoIndex: number): void {
        let yhteystiedotRyhma = this.state.henkilo.yhteystiedotRyhma;
        const emailNotOnlyYhteystietoInYhteystietoryhma = yhteystiedotRyhma[yhteystiedotRyhmaIndex].yhteystieto
            .filter((yhteystieto: Yhteystieto) => yhteystieto.yhteystietoTyyppi !== EMAIL)
            .some(
                (yhteystieto: Yhteystieto) =>
                    yhteystieto.yhteystietoArvo !== '' &&
                    yhteystieto.yhteystietoArvo !== null &&
                    yhteystieto.yhteystietoArvo !== undefined
            );

        if (emailNotOnlyYhteystietoInYhteystietoryhma) {
            const yhteystietoRyhma = yhteystiedotRyhma[yhteystiedotRyhmaIndex];
            yhteystietoRyhma.yhteystieto = remove(yhteystietoIndex, 1, yhteystietoRyhma.yhteystieto);
        } else {
            yhteystiedotRyhma = remove(yhteystiedotRyhmaIndex, 1, yhteystiedotRyhma);
        }

        this.setState({
            henkilo: { ...this.state.henkilo, yhteystiedotRyhma },
            emailFieldCount: notEmptyYhteystiedotRyhmaEmailCount(yhteystiedotRyhma),
        });
    }
}
