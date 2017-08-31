import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {fetchHenkiloMaster, unlinkHenkilo} from "../../../../actions/henkilo.actions"
import LabelValue from "./LabelValue"
import TextButton from "../../button/TextButton";

class MasterHenkilo extends React.Component {
    static propTypes = {
        oidHenkilo: PropTypes.string.isRequired,
        henkilo: PropTypes.shape({
            master: PropTypes.shape({
                kutsumanimi: PropTypes.string,
                sukunimi: PropTypes.string,
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
                !this.props.isLoading && this.props.henkilo.master.oidHenkilo && this.props.oidHenkilo !== this.props.henkilo.master.oidHenkilo
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
        isLoading: state.henkilo.master.masterLoading,
    };
};

export default connect(mapStateToProps, {fetchHenkiloMaster, unlinkHenkilo})(MasterHenkilo);
