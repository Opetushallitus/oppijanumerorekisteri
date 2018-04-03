// @flow
import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {fetchHenkilo, fetchHenkiloMaster, unlinkHenkilo} from "../../../../actions/henkilo.actions"
import LabelValue from "./LabelValue"
import TextButton from "../../button/TextButton";
import type {L} from "../../../../types/localisation.type";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";
import type { KayttooikeusOrganisaatiot } from '../../../../types/domain/kayttooikeus/KayttooikeusPerustiedot.types'
import { hasAnyPalveluRooli } from '../../../../utilities/palvelurooli.util'

type Props = {
    kayttooikeudet: Array<KayttooikeusOrganisaatiot>,
    oidHenkilo: string,
    henkilo: HenkiloState,
    L: L,
    fetchHenkiloMaster: (string) => void,
    fetchHenkilo: (string) => void,
    unlinkHenkilo: (string, string) => void,
    oppija?: boolean,
}

class MasterHenkilo extends React.Component<Props> {

    componentDidMount() {
        this.props.fetchHenkiloMaster(this.props.oidHenkilo);
    }

    render() {
        const hasPermission = hasAnyPalveluRooli(this.props.kayttooikeudet, ['HENKILONHALLINTA_OPHREKISTERI'])
        return <div>
            {
                !this.props.isLoading && this.props.henkilo.master.oidHenkilo && this.props.oidHenkilo !== this.props.henkilo.master.oidHenkilo
                    ?
                    <LabelValue
                        values={{
                            value:
                                <div className="nowrap">
                                    <Link to={this.getLinkHref(this.props.henkilo.master.oidHenkilo)}>
                                        {this.props.henkilo.master.kutsumanimi + ' ' + this.props.henkilo.master.sukunimi}
                                    </Link>
                                    {hasPermission &&
                                    <span>
                                        <span> | </span>
                                        <TextButton action={this.removeLink.bind(this, this.props.henkilo.master.oidHenkilo, this.props.oidHenkilo)}>
                                            {this.props.L['HENKILO_POISTA_LINKITYS']}
                                        </TextButton>
                                    </span>
                                    }
                                </div>,
                            label: 'HENKILO_LINKITETYT_MASTER',
                        }}
                        readOnly />
                    : null
            }
            </div>;
    }

    getLinkHref(oid) {
        const url = this.props.oppija ? 'oppija' : 'virkailija';
        return `/${url}/${oid}`
    }

    async removeLink(masterOid, slaveOid) {
        await this.props.unlinkHenkilo(masterOid, slaveOid);
        this.props.fetchHenkiloMaster(this.props.oidHenkilo);
        this.props.fetchHenkilo(this.props.oidHenkilo)
    }

}

const mapStateToProps = (state) => {
        return {
        l10n: state.l10n.localisations,
        locale: state.locale,
        L: state.l10n.localisations[state.locale],
        isLoading: state.henkilo.master.masterLoading,
        henkilo: state.henkilo,
        kayttooikeudet: state.omattiedot.organisaatiot,
    };
};

export default connect(mapStateToProps, {fetchHenkiloMaster, unlinkHenkilo, fetchHenkilo})(MasterHenkilo);
