import React from 'react'
import PropTypes from 'prop-types'
import Columns from 'react-columns'
import RekisteroidyPerustiedot from './content/RekisteroidyPerustiedot'
import Asiointikieli from "../common/henkilo/labelvalues/Asiointikieli";

class RekisteroidyPage extends React.Component {
    static propTypes = {
        koodisto: PropTypes.shape({
            kieli: PropTypes.array.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            henkilo: {
                henkilo: {
                    etunimet: '',
                    sukunimi: '',
                    kutsumanimi: '',
                },
                kayttajatieto: {
                    username: '',
                    password: '',
                    passwordAgain: '',
                },
            },
        };
    }

    render() {
        return <div className="borderless-wrapper">
            <span className="oph-h2 oph-bold">Rekisteröidy</span>
            <Columns columns={2} gap="25px">
                <div>
                    <RekisteroidyPerustiedot henkilo={this.state.henkilo} />
                </div>
                <div>

                </div>
            </Columns>
            <Asiointikieli henkilo={this.state.henkilo} koodisto={this.props.koodisto} henkiloUpdate={{}} />
        </div>;
    }
}

export default RekisteroidyPage;
