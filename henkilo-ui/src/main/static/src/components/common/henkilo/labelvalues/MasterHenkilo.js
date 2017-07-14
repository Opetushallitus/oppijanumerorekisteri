import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {fetchHenkiloMaster, unlinkHenkilo} from "../../../../actions/henkilo.actions"
import LabelValue from "./LabelValue"
import TextButton from "../../button/TextButton";

class MasterHenkilo extends React.Component {
    static propTypes = {
        oidHenkilo: React.PropTypes.string.isRequired,
        henkilo: React.PropTypes.shape({
            master: React.PropTypes.shape({
                kutsumanimi: React.PropTypes.string.isRequired,
                sukunimi: React.PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
    }

    componentDidMount() {
        this.props.fetchHenkiloMaster(this.props.oidHenkilo);
    }

    render() {
        return <div>
            {
                !this.props.loading && this.props.henkilo.master.oidHenkilo && this.props.oidHenkilo !== this.props.henkilo.master.oidHenkilo
                    ?
                    <LabelValue
                        values={{
                            value:
                                <div className="nowrap">
                                    <Link to={'/virkailija/' + this.props.henkilo.master.oidHenkilo}>
                                        {this.props.henkilo.master.kutsumanimi + ' ' + this.props.henkilo.master.sukunimi}
                                    </Link> | <TextButton action={this.removeLink.bind(this, this.props.henkilo.master.oidHenkilo, this.props.oidHenkilo)}>
                                    {this.L['HENKILO_POISTA_LINKITYS']}
                                </TextButton>
                                </div>,
                            label: 'HENKILO_LINKITETYT_MASTER',
                        }}
                        readOnly
                        L={this.L} />
                    : null
            }
            </div>;
    }

    async removeLink(masterOid, slaveOid) {
        await this.props.unlinkHenkilo(masterOid, slaveOid);
        this.props.fetchHenkiloMaster(this.props.oidHenkilo);
    }

}

const mapStateToProps = (state, ownProps) => {
    return {
        l10n: state.l10n.localisations,
        locale: state.locale,
        loading: state.henkilo.master.masterLoading,
    };
};

export default connect(mapStateToProps, {fetchHenkiloMaster, unlinkHenkilo})(MasterHenkilo);
