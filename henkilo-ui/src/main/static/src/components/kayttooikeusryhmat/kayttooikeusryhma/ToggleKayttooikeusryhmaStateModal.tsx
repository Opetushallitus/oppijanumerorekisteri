import React from 'react';
import { connect } from 'react-redux';
import { http } from '../../../http';
import { urls } from 'oph-urls-js';
import { SpinnerInButton } from '../../common/icons/SpinnerInButton';
import { Localisations } from '../../../types/localisation.type';
import { NOTIFICATIONTYPES } from '../../common/Notification/notificationtypes';
import { addGlobalNotification } from '../../../actions/notification.actions';
import { GlobalNotificationConfig } from '../../../types/notification.types';
import OphModal from '../../common/modal/OphModal';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { path } from 'ramda';

type OwnProps = {
    router: any;
    kayttooikeusryhmaId: string | null | undefined;
};

type Props = OwnProps & {
    L: Localisations;
    addGlobalNotification: (arg0: GlobalNotificationConfig) => void;
    valittuKayttooikeusryhma: Kayttooikeusryhma | null | undefined;
};

type State = {
    isWaitingRequest: boolean;
    isPassivoitu: boolean;
    showPassivoiModal: boolean;
};

/**
 * Napit ja modal käyttöoikeusryhmän tilan muuttamiseen passiiviseksi ja aktiiviseksi.
 */
class ToggleKayttooikeusryhmaStateModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            isWaitingRequest: false,
            isPassivoitu: !!path(['passivoitu'], props.valittuKayttooikeusryhma),
            showPassivoiModal: false,
        };
    }

    componentWillReceiveProps(nextProps: Props): void {
        const isPassivoitu = !!path(['passivoitu'], nextProps.valittuKayttooikeusryhma);
        if (isPassivoitu !== this.state.isPassivoitu) {
            this.setState({ isPassivoitu });
        }
    }

    render() {
        return (
            <React.Fragment>
                {this.props.kayttooikeusryhmaId && !this.state.isPassivoitu ? (
                    <button
                        className="oph-button oph-button-cancel"
                        onClick={() => {
                            this.setState({ showPassivoiModal: true });
                        }}
                    >
                        {this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PASSIVOI']}
                    </button>
                ) : (
                    <button
                        className="oph-button oph-button-primary"
                        onClick={() => {
                            this.setState({ showPassivoiModal: true });
                        }}
                    >
                        {this.props.L['KAYTTOOIKEUSRYHMAT_AKTIVOI']}
                    </button>
                )}
                {this.state.showPassivoiModal && (
                    <OphModal
                        title={
                            this.state.isPassivoitu
                                ? this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_AKTIVOI_VARMISTUS']
                                : this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PASSIVOI_VARMISTUS']
                        }
                        onClose={() => this.closeModalAction()}
                    >
                        <div className="passivoi-modal">
                            <button
                                className="oph-button oph-button-primary"
                                onClick={
                                    this.state.isPassivoitu
                                        ? this.aktivoiKayttooikeusryhma.bind(this)
                                        : this.passivoiKayttooikeusryhma.bind(this)
                                }
                            >
                                <SpinnerInButton show={this.state.isWaitingRequest} />{' '}
                                {this.state.isPassivoitu
                                    ? this.props.L['KAYTTOOIKEUSRYHMAT_AKTIVOI']
                                    : this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PASSIVOI']}
                            </button>
                            <button className="oph-button oph-button-cancel" onClick={() => this.closeModalAction()}>
                                {this.props.L['PERUUTA']}
                            </button>
                        </div>
                    </OphModal>
                )}
            </React.Fragment>
        );
    }

    async passivoiKayttooikeusryhma() {
        const url = urls.url('kayttooikeus-service.kayttooikeusryhma.id.passivoi', this.props.kayttooikeusryhmaId);
        await this.toggleKayttooikeusryhmaState(url);
    }

    async aktivoiKayttooikeusryhma() {
        const url = urls.url('kayttooikeus-service.kayttooikeusryhma.id.aktivoi', this.props.kayttooikeusryhmaId);
        await this.toggleKayttooikeusryhmaState(url);
    }

    async toggleKayttooikeusryhmaState(url: string) {
        try {
            this.setState({ isWaitingRequest: true });
            await http.put(url);
            this.setState({ isWaitingRequest: false }, () => {
                this.props.router.push('/kayttooikeusryhmat/');
            });
        } catch (error) {
            this.props.addGlobalNotification({
                key: 'KAYTTOOIKEUSRYHMATOGGLEVIRHE',
                title: this.props.L['KAYTTOOIKEUSRYHMAT_ODOTTAMATON_VIRHE'],
                type: NOTIFICATIONTYPES.ERROR,
                autoClose: 10000,
            });
            throw error;
        } finally {
            this.closeModalAction();
        }
    }

    closeModalAction = () => this.setState({ showPassivoiModal: false });
}

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale],
    valittuKayttooikeusryhma: state.kayttooikeus.kayttooikeusryhma,
});

export default connect<Props, OwnProps>(mapStateToProps, {
    addGlobalNotification,
})(ToggleKayttooikeusryhmaStateModal);
