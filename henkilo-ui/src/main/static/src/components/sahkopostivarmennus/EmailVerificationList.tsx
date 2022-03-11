import React from 'react';
import { Yhteystieto } from '../../types/domain/oppijanumerorekisteri/yhteystieto.types';
import './EmailVerificationList.css';
import { YhteystietoRyhma } from '../../types/domain/oppijanumerorekisteri/yhteystietoryhma.types';
import { validateEmail } from '../../validation/EmailValidator';
import { Localisations } from '../../types/localisation.type';

type Props = {
    yhteystiedotRyhma: Array<YhteystietoRyhma>;
    onEmailChange: (arg0: number, arg1: number, arg2: string) => void;
    onEmailRemove: (arg0: number, arg1: number) => void;
    L: Localisations;
    emailFieldCount: number;
};

/*
 * Yhteystietoryhma-listan sähköpostiosoitteet input-kenttinä
 */
export class EmailVerificationList extends React.Component<Props> {
    render() {
        return (
            <React.Fragment>
                {this.props.yhteystiedotRyhma.map((yhteystietoryhma: YhteystietoRyhma, ryhmaIndex: number) => {
                    return yhteystietoryhma.yhteystieto.map((yhteystieto: Yhteystieto, yhteystietoIndex: number) => {
                        if (yhteystieto.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI') {
                            const validEmail = yhteystieto.yhteystietoArvo
                                ? validateEmail(yhteystieto.yhteystietoArvo)
                                : false;
                            const classNames = validEmail
                                ? 'oph-input email-verification-field'
                                : 'oph-input oph-input-has-error email-verification-field';
                            return (
                                <span key={`${ryhmaIndex}-${yhteystietoIndex}`}>
                                    <input
                                        className={classNames}
                                        value={yhteystieto.yhteystietoArvo}
                                        type="text"
                                        placeholder={this.props.L['HENKILO_TYOSAHKOPOSTI']}
                                        onChange={(event: React.SyntheticEvent<HTMLInputElement>) =>
                                            this.props.onEmailChange(
                                                ryhmaIndex,
                                                yhteystietoIndex,
                                                event.currentTarget.value
                                            )
                                        }
                                    />
                                    {this.props.emailFieldCount > 1 ? (
                                        <i
                                            className="fa fa-times-circle oph-blue email-verification-remove"
                                            onClick={() => this.props.onEmailRemove(ryhmaIndex, yhteystietoIndex)}
                                        ></i>
                                    ) : null}
                                </span>
                            );
                        }

                        return null;
                    });
                })}
            </React.Fragment>
        );
    }
}
