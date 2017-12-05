import './RekisteroidyOrganisaatiot.css'
import React from 'react'
import PropTypes from 'prop-types'

class RekisteroidyOrganisaatiot extends React.Component {
    static propTypes = {
        organisaatiot: PropTypes.arrayOf(PropTypes.shape({
            kayttoOikeusRyhmat: PropTypes.arrayOf(PropTypes.shape({
                id: PropTypes.number.isRequired,
                nimi: PropTypes.shape({
                    fi: PropTypes.string,
                    sv: PropTypes.string,
                    en: PropTypes.string,
                }).isRequired,
            })).isRequired,
            nimi: PropTypes.shape({
                fi: PropTypes.string,
                sv: PropTypes.string,
                en: PropTypes.string,
            }).isRequired,
            organisaatioOid: PropTypes.string.isRequired,
        })).isRequired,
    };

    render() {
        return <div className="rekisteroidy-organisaatiot-wrapper">
            <p className="oph-h3 oph-bold">{this.props.L['REKISTEROIDY_ORGANISAATIOT_OTSIKKO']}</p>
            {
                this.props.organisaatiot.map(organisaatio => <div key={organisaatio.organisaatioOid}
                                                                  className="organisaatio-kayttooikeus-wrapper">
                    <p className="oph-bold">{organisaatio.nimi[this.props.locale] || organisaatio.organisaatioOid}</p>
                    <ul>
                        {
                            organisaatio.kayttoOikeusRyhmat.map(kayttooikeusRyhma =>
                                <li key={kayttooikeusRyhma.id}>
                                    {kayttooikeusRyhma.nimi[this.props.locale] || kayttooikeusRyhma.id}
                                </li>)
                        }
                    </ul>
                </div>)
            }
        </div>;
    }
}

export default RekisteroidyOrganisaatiot;
