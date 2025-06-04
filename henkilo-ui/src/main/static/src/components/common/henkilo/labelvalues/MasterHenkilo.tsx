import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import type { RootState } from '../../../../store';
import { fetchHenkilo, fetchHenkiloMaster, unlinkHenkilo } from '../../../../actions/henkilo.actions';
import TextButton from '../../button/TextButton';
import { Localisations } from '../../../../types/localisation.type';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { KayttooikeusOrganisaatiot } from '../../../../types/domain/kayttooikeus/KayttooikeusPerustiedot.types';
import { hasAnyPalveluRooli } from '../../../../utilities/palvelurooli.util';
import { FieldlessLabelValue } from './FieldlessLabelValue';

type OwnProps = {
    oidHenkilo: string;
    oppija?: boolean;
};

type StateProps = {
    L: Localisations;
    kayttooikeudet: Array<KayttooikeusOrganisaatiot>;
    henkilo: HenkiloState;
    isLoading: boolean;
};

type DispatchProps = {
    fetchHenkiloMaster: (oid: string) => void;
    fetchHenkilo: (oid: string) => void;
    unlinkHenkilo: (masterOid: string, slaveOid: string) => void;
};

type Props = OwnProps & StateProps & DispatchProps;
class MasterHenkilo extends React.Component<Props> {
    componentDidMount() {
        this.props.fetchHenkiloMaster(this.props.oidHenkilo);
    }

    render() {
        const hasPermission = hasAnyPalveluRooli(this.props.kayttooikeudet, [
            'HENKILONHALLINTA_OPHREKISTERI',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
        ]);
        const renderLinkitetyt =
            !this.props.isLoading &&
            this.props.henkilo.master.oidHenkilo &&
            this.props.oidHenkilo !== this.props.henkilo.master.oidHenkilo;

        return renderLinkitetyt ? (
            <FieldlessLabelValue label="HENKILO_LINKITETYT_MASTER" readOnly>
                <div className="nowrap">
                    <Link to={this.getLinkHref(this.props.henkilo.master.oidHenkilo)}>
                        {this.props.henkilo.master.kutsumanimi + ' ' + this.props.henkilo.master.sukunimi}
                    </Link>
                    {hasPermission && (
                        <span>
                            <span> | </span>
                            <TextButton
                                action={this.removeLink.bind(
                                    this,
                                    this.props.henkilo.master.oidHenkilo,
                                    this.props.oidHenkilo
                                )}
                            >
                                {this.props.L['HENKILO_POISTA_LINKITYS']}
                            </TextButton>
                        </span>
                    )}
                </div>
            </FieldlessLabelValue>
        ) : null;
    }

    getLinkHref(oid: string) {
        const url = this.props.oppija ? 'oppija' : 'virkailija';
        return `/${url}/${oid}`;
    }

    async removeLink(masterOid: string, slaveOid: string) {
        await this.props.unlinkHenkilo(masterOid, slaveOid);
        this.props.fetchHenkiloMaster(this.props.oidHenkilo);
        this.props.fetchHenkilo(this.props.oidHenkilo);
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
    isLoading: state.henkilo.masterLoading,
    henkilo: state.henkilo,
    kayttooikeudet: state.omattiedot.organisaatiot,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    fetchHenkiloMaster,
    unlinkHenkilo,
    fetchHenkilo,
})(MasterHenkilo);
