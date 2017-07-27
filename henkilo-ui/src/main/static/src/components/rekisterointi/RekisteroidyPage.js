import React from 'react'
import PropTypes from 'prop-types'
import Columns from 'react-columns'
import RekisteroidyPerustiedot from './content/RekisteroidyPerustiedot'
import Asiointikieli from "../common/henkilo/labelvalues/Asiointikieli";
import RekisteroidyOrganisaatiot from "./content/RekisteroidyOrganisaatiot";
import StaticUtils from "../common/StaticUtils";
import Button from "../common/button/Button";

class RekisteroidyPage extends React.Component {
    static propTypes = {
        koodisto: PropTypes.shape({
            kieli: PropTypes.array.isRequired,
        }).isRequired,
        kutsu: PropTypes.shape({
            temporaryToken: PropTypes.string.isRequired,
            etunimi: PropTypes.string.isRequired,
            sukunimi: PropTypes.string.isRequired,
            asiointikieli: PropTypes.string.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            henkilo: {
                etunimet: this.props.kutsu.etunimi,
                sukunimi: this.props.kutsu.sukunimi,
                kutsumanimi: this.props.kutsu.etunimi.split(' ')[0] || '',
                asiointiKieli: {
                    kieliKoodi: this.props.kutsu.asiointikieli,
                },
                kayttajanimi: this.props.kutsu.sahkoposti.split('@')[0] || '',
                password: '',
                passwordAgain: '',
            }
        };
    }

    render() {
        return <div className="borderless-wrapper">
            <div className="header">
                <p className="oph-h2 oph-bold">{this.props.L['REKISTEROIDY_OTSIKKO']}</p>
            </div>
            <Columns columns={2} gap="25px">
                <div>
                    <RekisteroidyPerustiedot henkilo={{henkilo: this.state.henkilo}}
                                             updatePayloadModel={this.updatePayloadModelInput.bind(this)} />
                </div>
                <div>
                    <RekisteroidyOrganisaatiot organisaatiot={this.props.kutsu.organisaatiot} />
                </div>
            </Columns>
            <Asiointikieli koodisto={this.props.koodisto}
                           henkiloUpdate={this.state.henkilo}
                           updateModelFieldAction={this.updatePayloadModelInput.bind(this)} />
            <Button action={() => {}} disabled={this.isValid()} >
                {this.props.L['REKISTEROIDY_TALLENNA_NAPPI']}
            </Button>
        </div>;
    }

    updatePayloadModelInput(event) {
        this.setState({
            henkilo: StaticUtils.updateFieldByDotAnnotation(this.state.henkilo, event),
        });
    }

    isValid() {
        return false;
    }
}

export default RekisteroidyPage;
