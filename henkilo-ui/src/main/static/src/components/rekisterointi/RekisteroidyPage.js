import React from 'react'
import PropTypes from 'prop-types'
import Columns from 'react-columns'
import RekisteroidyPerustiedot from './content/RekisteroidyPerustiedot'
import Asiointikieli from "../common/henkilo/labelvalues/Asiointikieli";
import RekisteroidyOrganisaatiot from "./content/RekisteroidyOrganisaatiot";
import StaticUtils from "../common/StaticUtils";
import Button from "../common/button/Button";
import PropertySingleton from "../../globals/PropertySingleton"

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
        createHenkiloByToken: PropTypes.func.isRequired,
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
            },
            isValid: false,
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
            <Button action={this.createHenkilo.bind(this)} disabled={!this.state.isValid} >
                {this.props.L['REKISTEROIDY_TALLENNA_NAPPI']}
            </Button>
        </div>;
    }

    updatePayloadModelInput(event) {
        const henkilo = StaticUtils.updateFieldByDotAnnotation(this.state.henkilo, event);
        this.setState({
            henkilo: henkilo,
            isValid: this.isValid(henkilo),
        });
    }

    isValid(henkilo) {
        const regex = PropertySingleton.getState().specialCharacterRegex;
        return henkilo.etunimet.split(' ').filter(nimi => nimi === henkilo.kutsumanimi)
            && henkilo.kayttajanimi !== ''
            && henkilo.password === henkilo.passwordAgain
            && henkilo.password !== ''
            && henkilo.password.length >= PropertySingleton.getState().minimunPasswordLength
            && regex.exec(henkilo.password) !== null
            && henkilo.asiointiKieli.kieliKoodi !== '';
    }

    createHenkilo() {
        const payload = {...this.state.henkilo};
        this.props.createHenkiloByToken(this.props.kutsu.temporaryToken, payload);
    }
}

export default RekisteroidyPage;
