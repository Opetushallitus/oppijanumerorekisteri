import React from 'react';
import PropTypes from 'prop-types'
import {Link} from 'react-router';
import LabelValueGroup from './LabelValueGroup';
import TextButton from '../../button/TextButton';

export default class LinkitetytHenkilot extends React.Component {
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
            ? <LabelValueGroup {...this.props} valueGroup={this.valueGroup()} label={'HENKILO_LINKITETYT'}/>
            : null}
        </div>;
    }

    valueGroup() {
        return <div> {this.props.henkilo.slaves.map((slave, index) =>
            <div key={index} className="nowrap">
                <Link to={'/virkailija/' + slave.oidHenkilo}>{slave.kutsumanimi} {slave.sukunimi}</Link> | <TextButton action={this.removeLink.bind(this, this.props.henkilo.henkilo.oidHenkilo, slave.oidHenkilo)}>
                {this.props.L['HENKILO_POISTA_LINKITYS']}
            </TextButton>
            </div>)}
        </div>;
    }

    async removeLink(masterOid, slaveOid) {
        await this.props.unlinkHenkilo(masterOid, slaveOid);
        this.props.fetchHenkiloSlaves(masterOid);
    }

}
