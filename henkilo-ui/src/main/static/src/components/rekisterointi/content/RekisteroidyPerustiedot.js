// @flow
import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Etunimet from "../../common/henkilo/labelvalues/Etunimet";
import Sukunimi from "../../common/henkilo/labelvalues/Sukunimi";
import Kutsumanimi from "../../common/henkilo/labelvalues/Kutsumanimi";
import Kayttajanimi from "../../common/henkilo/labelvalues/Kayttajanimi";
import Salasana from "../../common/henkilo/labelvalues/Salasana";
import Asiointikieli from "../../common/henkilo/labelvalues/Asiointikieli";
import type {L} from "../../../types/localisation.type";

type Props = {
    henkilo: {
        henkilo: {
            etunimet: string,
            sukunimi: string,
            kutsumanimi: string,
            asiointiKieli: {
                kieliKoodi: string,
            },
            kayttajanimi: string,
            password: string,
            passwordAgain: string,
        }
    },
    updatePayloadModel: (string) => void,
    koodisto: {
        kieli: Array<{}>,
    },
    notifications: Array<{id: string, type: string, errorType: string,}>,
    isUsernameError: boolean,
    isPasswordError: boolean,
    isLanguageError: boolean,
    isKutsumanimiError: boolean,
    L: L,
}

class RekisteroidyPerustiedot extends React.Component<Props> {
    static propTypes = {
        henkilo: PropTypes.shape({
            henkilo: PropTypes.shape({
                etunimet: PropTypes.string,
                sukunimi: PropTypes.string,
                kutsumanimi: PropTypes.string,
            }),
            username: PropTypes.string,
            password: PropTypes.string,
            passwordAgain: PropTypes.string,
        }).isRequired,
        updatePayloadModel: PropTypes.func.isRequired,
        koodisto: PropTypes.shape({
            kieli: PropTypes.array.isRequired,
        }).isRequired,
        notifications: PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.string,
            id: PropTypes.string,
            errorType: PropTypes.string,
        })),
        isUsernameError: PropTypes.bool.isRequired,
        isPasswordError: PropTypes.bool.isRequired,
        isLanguageError: PropTypes.bool.isRequired,
        isKutsumanimiError: PropTypes.bool.isRequired,
    };

    render() {
        return <div>
            { this.props.henkilo && <div>
                <p className="oph-h3 oph-bold">{this.props.L['REKISTEROIDY_PERUSTIEDOT']}</p>
                <Etunimet readOnly={true} />
                <Sukunimi readOnly={true} />
                <Kutsumanimi
                    readOnly={false}
                    autoFocus
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
                    isError={this.props.isLanguageError}
                />
            </div>
        }
        </div>;
    }

    isKayttajanimiError() {
        return !!this.props.notifications.filter(notification =>
            notification.id === 'rekisteroidyPage'
            && (notification.errorType === 'UsernameAlreadyExistsException'
            || notification.errorType === 'IllegalArgumentException'))[0];
    }

    isSalasanaError() {
        return !!this.props.notifications.filter(notification =>
            notification.id === 'rekisteroidyPage'
            && notification.errorType === 'PasswordException')[0];
    }
}

const mapStateToProps = (state) => ({
    notifications: state.notifications.buttonNotifications,
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps, {})(RekisteroidyPerustiedot);
