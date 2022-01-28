import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../reducers';
import { OmattiedotState } from '../../reducers/omattiedot.reducer';
import AdminViewContainer from './AdminViewContainer';
import VirkailijaViewContainer from './VirkailijaViewContainer';
import OppijaViewContainer from './OppijaViewContainer';
import { LocalNotification } from '../common/Notification/LocalNotification';
import { NOTIFICATIONTYPES } from '../common/Notification/notificationtypes';
import { L10n } from '../../types/localisation.type';
import { Locale } from '../../types/locale.type';
import Loader from '../common/icons/Loader';
import { path } from 'ramda';
import { fetchHenkilo } from '../../actions/henkilo.actions';
import { fetchOmattiedot } from '../../actions/omattiedot.actions';
import { HenkiloState } from '../../reducers/henkilo.reducer';

type OwnProps = {
    router: any;
    location: any;
    params: any;
    henkilo: HenkiloState;
};

type StateProps = {
    path: string;
    omattiedot: OmattiedotState;
    oidHenkilo: string;
    ownOid: string;
    henkiloType: string;
    l10n: L10n;
    locale: Locale;
    externalPermissionService?: string;
    isAdmin: boolean;
};

type DispatchProps = {
    fetchHenkilo: (arg0: string) => void;
    fetchOmattiedot: () => void;
};

type Props = OwnProps & StateProps & DispatchProps;
/*
 * Henkilo-näkymä. Päätellään näytetäänkö admin/virkailija/oppija -versio henkilöstä, vai siirrytäänkö omattiedot-sivulle
 */
class HenkiloViewContainer extends React.Component<Props> {
    async componentDidMount() {
        await this.props.fetchOmattiedot();
        if (this.props.oidHenkilo && this.props.ownOid && this.props.ownOid === this.props.oidHenkilo) {
            this.props.router.replace('/omattiedot');
        }
    }

    render() {
        const view = this.props.path.split('/')[1];
        if (!this.props.omattiedot.data || this.props.omattiedot.omattiedotLoading) {
            return <Loader />;
        } else if (this.props.omattiedot.isAdmin) {
            return <AdminViewContainer {...this.props}></AdminViewContainer>;
        } else if (view === 'virkailija') {
            return <VirkailijaViewContainer {...this.props}></VirkailijaViewContainer>;
        } else if (view === 'oppija') {
            return <OppijaViewContainer {...this.props}></OppijaViewContainer>;
        }

        return (
            <LocalNotification
                type={NOTIFICATIONTYPES.WARNING}
                title={this.props.l10n[this.props.locale]['HENKILO_SIVU_VIRHE']}
                toggle={true}
            />
        );
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => ({
    path: ownProps.location.pathname,
    oidHenkilo: ownProps.params['oid'],
    henkiloType: ownProps.params['henkiloType'],
    omattiedot: state.omattiedot,
    l10n: state.l10n.localisations,
    locale: state.locale,
    isAdmin: state.omattiedot.isAdmin,
    ownOid: path(['data', 'oid'], state.omattiedot),
    externalPermissionService: path(['location', 'query', 'permissionCheckService'], ownProps),
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    fetchHenkilo,
    fetchOmattiedot,
})(HenkiloViewContainer);
