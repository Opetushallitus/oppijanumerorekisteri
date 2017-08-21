import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Asiointikieli from "../../common/henkilo/labelvalues/Asiointikieli";

class RekisteroidyPerustiedot extends React.Component {
    static propTypes = {
        henkilo: PropTypes.shape({
            henkilo: PropTypes.shape({
                etunimet: PropTypes.string,
                sukunimi: PropTypes.string,
                kutsumanimi: PropTypes.string,
            }),
            username: PropTypes.string,
            password: PropTypes.string,
            passwordAgain: PropTypes.string,
        }).isRequired,
        updatePayloadModel: PropTypes.func.isRequired,
        koodisto: PropTypes.shape({
            kieli: PropTypes.array.isRequired,
        }).isRequired,
    };

    render() {
        return <div>
            <p className="oph-h3 oph-bold">{this.props.L['REKISTEROIDY_HAKA_OTSIKKO']}</p>
            <Asiointikieli koodisto={this.props.koodisto}
                           henkiloUpdate={this.props.henkilo.henkilo}
                           updateModelFieldAction={this.props.updatePayloadModel} />

        </div>
    }
}

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps)(RekisteroidyPerustiedot);
