import React from 'react';
import './LinkitetytHenkilot.css'
import {Link} from 'react-router';
import LabelValueGroup from './LabelValueGroup';
import TextButton from '../../button/TextButton';

export default class LinkitetytHenkilot extends React.Component {
    static propTypes = {
        henkilo: React.PropTypes.shape({
            henkilo: React.PropTypes.shape({
                oidHenkilo: React.PropTypes.string.isRequired,
            }).isRequired,
            slaves: React.PropTypes.arrayOf({
                kutsumanimi: React.PropTypes.string.isRequired,
                sukunimi: React.PropTypes.string.isRequired,
                oidHenkilo: React.PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
        L: React.PropTypes.object.isRequired,
        unlinkHenkilo: React.PropTypes.func.isRequired,
        fetchHenkiloSlaves: React.PropTypes.func.isRequired,
    };

    render() {
        return <div>{this.props.henkilo.slaves.length
            ? <LabelValueGroup {...this.props} valueGroup={this.valueGroup()} label={'HENKILO_LINKITETYT'}/>
            : null}
        </div>;
    }

    valueGroup() {
        return <div> {this.props.henkilo.slaves.map((slave, index) =>
            <div key={index} className="linkitetyt-henkilot-labelvalue">
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
