import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Etunimet from "../../common/henkilo/labelvalues/Etunimet";
import Sukunimi from "../../common/henkilo/labelvalues/Sukunimi";
import Kutsumanimi from "../../common/henkilo/labelvalues/Kutsumanimi";
import Kayttajanimi from "../../common/henkilo/labelvalues/Kayttajanimi";
import Salasana from "../../common/henkilo/labelvalues/Salasana";

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
    };

    render() {
        const henkilo = this.props.henkilo;
        return <div>
            <p className="oph-h3 oph-bold">{this.props.L['REKISTEROIDY_PERUSTIEDOT']}</p>
            <Etunimet henkilo={henkilo} readOnly={true} required />
            <Sukunimi henkilo={henkilo} readOnly={true} required />
            <Kutsumanimi readOnly={false} autoFocus henkilo={henkilo} updateModelFieldAction={this.props.updatePayloadModel} required />
            <Kayttajanimi disabled={false} henkilo={{kayttajatieto: {username: henkilo.henkilo.kayttajanimi}}} updateModelFieldAction={this.props.updatePayloadModel} required />
            <Salasana disabled={false} updateModelFieldAction={this.props.updatePayloadModel} required />
        </div>
    }
}

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps)(RekisteroidyPerustiedot);
