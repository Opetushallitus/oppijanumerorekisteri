import React from 'react';
import { connect } from 'react-redux';
import { RouteActions } from 'react-router-redux';

import type { RootState } from '../../store';
import { Locale } from '../../types/locale.type';
import { EmailVerificationPage } from './EmailVerificationPage';
import { Localisations } from '../../types/localisation.type';
import { urls } from 'oph-urls-js';
import { http } from '../../http';
import { addGlobalNotification } from '../../actions/notification.actions';
import { NOTIFICATIONTYPES } from '../../components/common/Notification/notificationtypes';
import Loader from '../../components/common/icons/Loader';
import { Henkilo } from '../../types/domain/oppijanumerorekisteri/henkilo.types';
import { AppDispatch } from '../../store';

type OwnProps = {
    params: { loginToken?: string; locale?: Locale };
    router: RouteActions;
};

type StateProps = {
    loginToken: string;
    locale: Locale;
    L: Localisations;
};

type DispatchProps = {
    errorNotification: (title: string) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

type State = {
    loading: boolean;
    henkilo: Partial<Henkilo>;
};

/*
 * Virkailijan sähköpostin varmentamisen käyttöliittymä
 */
class EmailVerificationContainer extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            loading: true,
            henkilo: { yhteystiedotRyhma: [] },
        };
    }

    async componentDidMount() {
        if (this.props.loginToken) {
            const url = urls.url('kayttooikeus-service.cas.henkilo.bylogintoken', this.props.loginToken);
            this.setState({ loading: true });
            const henkilo = await http.get<Henkilo>(url).catch((error) => {
                this.props.errorNotification(this.props.L['REKISTEROIDY_TEMP_TOKEN_INVALID']);
                this.setState({ loading: false });
                throw error;
            });
            this.setState({ henkilo, loading: false });
        }
    }

    render() {
        return this.state.loading ? (
            <Loader />
        ) : (
            <EmailVerificationPage
                henkilo={this.state.henkilo}
                locale={this.props.locale}
                L={this.props.L}
                loginToken={this.props.loginToken}
                router={this.props.router}
                errorNotification={this.props.errorNotification}
            />
        );
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => ({
    L: state.l10n.localisations[ownProps.params['locale'].toLowerCase()],
    loginToken: ownProps.params['loginToken'],
    locale: ownProps.params['locale'],
});

const mapDispatchToProps = (dispatch: AppDispatch): DispatchProps => ({
    errorNotification: (title: string) =>
        dispatch(
            addGlobalNotification({
                key: 'KAYTTOOIKEUSRAPORTTI_ERROR',
                title,
                type: NOTIFICATIONTYPES.ERROR,
                autoClose: 10000,
            })
        ),
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(EmailVerificationContainer);
