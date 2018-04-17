//@flow
import React from 'react'
import { connect } from 'react-redux'
import { http } from '../../http'
import { urls } from 'oph-urls-js'
import type { VirkailijaCreate } from '../../types/domain/kayttooikeus/virkailija.types'
import type { L } from "../../types/localisation.type";
import { updateEmptyNavigation } from "../../actions/navigation.actions";
import VirkailijaCreateForm from './VirkailijaCreateForm';
import { isValidKutsumanimi } from '../../validation/KutsumanimiValidator'
import { isValidPassword } from '../../validation/PasswordValidator'
import { LocalNotification } from '../common/Notification/LocalNotification';
import { isValidKayttajatunnus } from '../../validation/KayttajatunnusValidator';

type Props = {
    router: any,
    L: L,
    updateEmptyNavigation: () => void,
}

type State = {
    virkailija: VirkailijaCreate,
    virheet: Array<string>,
}

/**
 * Virkailijan luonti -näkymä.
 */
class VirkailijaCreateContainer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)

        this.state = {
            virkailija: {
                etunimet: '',
                kutsumanimi: '',
                sukunimi: '',
                kayttajatunnus: '',
                salasana: '',
                salasanaUudestaan: '',
                vahvastiTunnistettu: true,
            },
            virheet: []
        };
    }

    componentDidMount() {
        this.props.updateEmptyNavigation();
    }

    render() {
        const disabled = this.state.virheet.length > 0
            // pakolliset kentät:
            || !this.state.virkailija.etunimet
            || !this.state.virkailija.kutsumanimi
            || !this.state.virkailija.sukunimi
            || !this.state.virkailija.kayttajatunnus
            || !this.state.virkailija.salasana
            || !this.state.virkailija.salasanaUudestaan;
        return (
            <div className="wrapper">
                <span className="oph-h2 oph-bold">{this.props.L['VIRKAILIJAN_LUONTI_OTSIKKO']}</span>
                <VirkailijaCreateForm
                    virkailija={this.state.virkailija}
                    disabled={disabled}
                    onChange={this.onChange}
                    onSubmit={this.onSubmit}
                    L={this.props.L}
                />
                <LocalNotification title={this.props.L['NOTIFICATION_HENKILOTIEDOT_VIRHE_OTSIKKO']} toggle={this.state.virheet.length > 0} type="error">
                    <ul>
                        {this.state.virheet.map((virhe, index) => <li key={index}>{virhe}</li>)}
                    </ul>
                </LocalNotification>
            </div>
        )
    }

    onChange = (virkailija: VirkailijaCreate): void => {
        const virheet = this.validate(virkailija)
        this.setState({ virkailija: virkailija, virheet: virheet });
    }

    validate = (virkailija: VirkailijaCreate): Array<string> => {
        const virheet = []
        if (virkailija.kutsumanimi) {
            if (!isValidKutsumanimi(virkailija.etunimet, virkailija.kutsumanimi)) {
                virheet.push(this.props.L['REKISTEROIDY_ERROR_KUTSUMANIMI'])
            }
        }
        if (virkailija.kayttajatunnus) {
            if (!isValidKayttajatunnus(virkailija.kayttajatunnus)) {
                virheet.push(this.props.L['NOTIFICATION_HENKILOTIEDOT_KAYTTAJATUNNUS_VIRHE'])
            }
        }
        if (virkailija.salasana) {
            if (!isValidPassword(virkailija.salasana)) {
                virheet.push(this.props.L['REKISTEROIDY_ERROR_PASSWORD_INVALID'])
            }
            if (virkailija.salasana !== virkailija.salasanaUudestaan) {
                virheet.push(this.props.L['REKISTEROIDY_ERROR_PASSWORD_MATCH'])
            }
        }
        return virheet
    }

    onSubmit = async (virkailijaCreate: VirkailijaCreate): Promise<void> => {
        try {
            const oid = await this.createVirkailija(virkailijaCreate);
            this.navigateToVirkailija(oid);
        } catch (error) {
            this.handleError(error)
            throw error
        }
    };

    handleError = (error: any): void => {
        if (error.errorType === 'AccessDeniedException') {
            this.setState({ virheet: [...this.state.virheet, this.props.L['VIRKAILIJAN_LUONTI_EI_OIKEUKSIA']] })
        } else if (error.errorType === 'UsernameAlreadyExistsException') {
            this.setState({ virheet: [...this.state.virheet, this.props.L['REKISTEROIDY_USERNAMEEXISTS_OTSIKKO']] })
        } else {
            this.setState({ virheet: [...this.state.virheet, this.props.L['HENKILON_LUONTI_EPAONNISTUI']] })
        }
    }

    createVirkailija = async (virkailija: VirkailijaCreate): Promise<string> => {
        const url = urls.url('kayttooikeus-service.virkailija');
        return await http.post(url, virkailija);
    }

    navigateToVirkailija = (oid: string) => {
        this.props.router.push(`/virkailija/${oid}`);
    }

}

const mapStateToProps = (state) => {
    return {
        L: state.l10n.localisations[state.locale],
    };
};

export default connect(mapStateToProps, { updateEmptyNavigation })(VirkailijaCreateContainer);
