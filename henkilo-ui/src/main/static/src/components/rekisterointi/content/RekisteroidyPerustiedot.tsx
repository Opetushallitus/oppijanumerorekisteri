import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../store';
import Etunimet from '../../common/henkilo/labelvalues/Etunimet';
import Sukunimi from '../../common/henkilo/labelvalues/Sukunimi';
import Kutsumanimi from '../../common/henkilo/labelvalues/Kutsumanimi';
import Kayttajanimi from '../../common/henkilo/labelvalues/Kayttajanimi';
import Salasana from '../../common/henkilo/labelvalues/Salasana';
import Asiointikieli from '../../common/henkilo/labelvalues/Asiointikieli';
import type { Localisations } from '../../../types/localisation.type';
import type { Notification } from '../../../reducers/notifications.reducer';

type OwnProps = {
    henkilo: {
        henkilo: {
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
    };
    updatePayloadModel: (arg0: string) => void;
    koodisto: {
        kieli: Array<{}>;
    };
    isUsernameError: boolean;
    isPasswordError: boolean;
    isLanguageError: boolean;
    isKutsumanimiError: boolean;
};

type StateProps = {
    notifications: Notification[];
    L: Localisations;
};

type Props = OwnProps & StateProps;

class RekisteroidyPerustiedot extends React.Component<Props> {
    render() {
        return (
            <div>
                {this.props.henkilo && (
                    <div>
                        <p className="oph-h3 oph-bold">{this.props.L['REKISTEROIDY_PERUSTIEDOT']}</p>
                        <Etunimet readOnly={true} />
                        <Sukunimi readOnly={true} />
                        <Kutsumanimi
                            readOnly={false}
                            defaultValue={this.props.henkilo.henkilo.kutsumanimi}
                            updateModelFieldAction={this.props.updatePayloadModel}
                            isError={this.props.isKutsumanimiError}
                        />
                        <Kayttajanimi
                            disabled={false}
                            defaultValue={this.props.henkilo.henkilo.kayttajanimi}
                            updateModelFieldAction={this.props.updatePayloadModel}
                            isError={this.isKayttajanimiError() || this.props.isUsernameError}
                        />
                        <Salasana
                            disabled={false}
                            updateModelFieldAction={this.props.updatePayloadModel}
                            isError={this.isSalasanaError() || this.props.isPasswordError}
                        />
                        <Asiointikieli
                            henkiloUpdate={this.props.henkilo.henkilo}
                            updateModelFieldAction={this.props.updatePayloadModel}
                        />
                    </div>
                )}
            </div>
        );
    }

    isKayttajanimiError() {
        return !!this.props.notifications.filter(
            (notification) =>
                notification.id === 'rekisteroidyPage' &&
                (notification.errorType === 'UsernameAlreadyExistsException' ||
                    notification.errorType === 'IllegalArgumentException')
        )[0];
    }

    isSalasanaError() {
        return !!this.props.notifications.filter(
            (notification) => notification.id === 'rekisteroidyPage' && notification.errorType === 'PasswordException'
        )[0];
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    notifications: state.notifications.buttonNotifications,
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, {}, OwnProps, RootState>(mapStateToProps)(RekisteroidyPerustiedot);
