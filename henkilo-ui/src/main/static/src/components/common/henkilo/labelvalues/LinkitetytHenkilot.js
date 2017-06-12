import React from 'react';
import LabelValueGroup from './LabelValueGroup';
import TextButton from '../../button/TextButton';

export default class LinkitetytHenkilot extends React.Component {

    render() {
        return <LabelValueGroup {...this.props} valueGroup={this.valueGroup()} label={'HENKILO_LINKITETYT'}/>;
    }

    valueGroup() {
        return <div> {this.props.henkilo.slaves.map((slave, index) =>
            <div key={index}>{slave.etunimet} {slave.sukunimi} - <TextButton action={this.removeLink.bind(this, this.props.henkilo.henkilo.oidHenkilo, slave.oidHenkilo)}>{this.props.L['HENKILO_POISTA_LINKITYS']}</TextButton></div>)}
        </div>;
    }

    async removeLink(masterOid, slaveOid) {
        await this.props.unlinkHenkilo(masterOid, slaveOid);
        this.props.fetchHenkiloSlaves(masterOid);
    }

}
