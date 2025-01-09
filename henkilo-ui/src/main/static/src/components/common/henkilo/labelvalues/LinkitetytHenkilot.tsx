import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../store';
import { Link } from 'react-router';
import LabelValueGroup from './LabelValueGroup';
import TextButton from '../../button/TextButton';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { Localisations } from '../../../../types/localisation.type';
import { unlinkHenkilo, fetchHenkiloSlaves } from '../../../../actions/henkilo.actions';
import { KayttooikeusOrganisaatiot } from '../../../../types/domain/kayttooikeus/KayttooikeusPerustiedot.types';
import { hasAnyPalveluRooli } from '../../../../utilities/palvelurooli.util';
import HenkiloVarmentajaSuhde from './HenkiloVarmentajaSuhde';

type OwnProps = {
    oppija?: boolean;
};

type StateProps = {
    kayttooikeudet: KayttooikeusOrganisaatiot[];
    henkilo: HenkiloState;
    L: Localisations;
};

type DispatchProps = {
    unlinkHenkilo: (masterOid: string, slaveOid: string) => void;
    fetchHenkiloSlaves: (oidHenkilo: string) => void;
};

type LinkitetytHenkilotProps = OwnProps & StateProps & DispatchProps;

/**
 * Henkilön linkitykset (duplikaattislave- ja varmentaja-suhteet)
 */
class LinkitetytHenkilot extends React.Component<LinkitetytHenkilotProps> {
    render() {
        return (
            <div>
                <React.Fragment>
                    {!!this.props.henkilo.slaves.length && (
                        <LabelValueGroup valueGroup={this.valueGroup()} label={'HENKILO_LINKITETYT'} />
                    )}
                </React.Fragment>
                <HenkiloVarmentajaSuhde oidHenkilo={this.props.henkilo.henkilo.oidHenkilo} type="henkiloVarmentajas" />
                <HenkiloVarmentajaSuhde
                    oidHenkilo={this.props.henkilo.henkilo.oidHenkilo}
                    type="henkiloVarmennettavas"
                />
            </div>
        );
    }

    valueGroup() {
        const hasPermission = hasAnyPalveluRooli(this.props.kayttooikeudet, [
            'HENKILONHALLINTA_OPHREKISTERI',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
        ]);
        return (
            <div>
                {this.props.henkilo.slaves.map((slave, index) => (
                    <div key={index} className="nowrap">
                        <Link to={this.getLinkHref(slave.oidHenkilo)}>
                            {slave.kutsumanimi} {slave.sukunimi}
                        </Link>
                        {hasPermission && (
                            <span>
                                <span> | </span>
                                <TextButton
                                    action={this.removeLink.bind(
                                        this,
                                        this.props.henkilo.henkilo.oidHenkilo,
                                        slave.oidHenkilo
                                    )}
                                >
                                    {this.props.L['HENKILO_POISTA_LINKITYS']}
                                </TextButton>
                            </span>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    getLinkHref(oid: string) {
        const url = this.props.oppija ? 'oppija' : 'virkailija';
        return `/${url}/${oid}`;
    }

    async removeLink(masterOid: string, slaveOid: string) {
        await this.props.unlinkHenkilo(masterOid, slaveOid);
        this.props.fetchHenkiloSlaves(masterOid);
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
    henkilo: state.henkilo,
    kayttooikeudet: state.omattiedot.organisaatiot,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    unlinkHenkilo,
    fetchHenkiloSlaves,
})(LinkitetytHenkilot);
