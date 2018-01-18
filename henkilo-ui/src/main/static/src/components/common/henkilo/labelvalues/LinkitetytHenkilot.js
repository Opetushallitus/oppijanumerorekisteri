// @flow
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Link} from 'react-router';
import LabelValueGroup from './LabelValueGroup';
import TextButton from '../../button/TextButton';
import * as R from 'ramda';
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";
import type {L} from "../../../../types/localisation.type";
import {unlinkHenkilo, fetchHenkiloSlaves} from '../../../../actions/henkilo.actions';

type Props = {
    henkilo: HenkiloState,
    L: L,
    unlinkHenkilo: (string, string) => void,
    fetchHenkiloSlaves: (string) => void,
    oppija?: boolean,
}

class LinkitetytHenkilot extends React.Component<Props> {
    static propTypes = {
        henkilo: PropTypes.shape({
            henkilo: PropTypes.shape({
                oidHenkilo: PropTypes.string.isRequired,
            }).isRequired,
            slaves: PropTypes.arrayOf(PropTypes.shape({
                kutsumanimi: PropTypes.string.isRequired,
                sukunimi: PropTypes.string.isRequired,
                oidHenkilo: PropTypes.string.isRequired,
            })).isRequired,
        }).isRequired,
        L: PropTypes.object.isRequired,
        unlinkHenkilo: PropTypes.func.isRequired,
        fetchHenkiloSlaves: PropTypes.func.isRequired,
    };

    render() {
        return <div>{this.props.henkilo.slaves.length
            ? <LabelValueGroup valueGroup={this.valueGroup()} label={'HENKILO_LINKITETYT'}/>
            : null}
        </div>;
    }

    valueGroup() {
        return R.path(['henkilo', 'slaves'], this.props)
            ? <div>
                {this.props.henkilo.slaves.map((slave, index) =>
                    <div key={index} className="nowrap">
                        <Link to={this.getLinkHref(slave.oidHenkilo)}>{slave.kutsumanimi} {slave.sukunimi}</Link> | <TextButton action={this.removeLink.bind(this, this.props.henkilo.henkilo.oidHenkilo, slave.oidHenkilo)}>
                        {this.props.L['HENKILO_POISTA_LINKITYS']}
                    </TextButton>
                    </div>
                )}
            </div>
            : null;
    }

    getLinkHref(oid) {
        const url = this.props.oppija ? 'oppija' : 'virkailija'
        return `/${url}/${oid}`
    }

    async removeLink(masterOid, slaveOid) {
        await this.props.unlinkHenkilo(masterOid, slaveOid);
        this.props.fetchHenkiloSlaves(masterOid);
    }
}

const mapStateToProps = state => ({
    L: state.l10n.localisations[state.locale],
    henkilo: state.henkilo,
});

export default connect(mapStateToProps, {unlinkHenkilo, fetchHenkiloSlaves})(LinkitetytHenkilot);
