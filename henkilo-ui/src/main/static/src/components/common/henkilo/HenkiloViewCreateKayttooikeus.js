import './HenkiloViewCreateKayttooikeus.css'
import React from 'react'
import Select2 from '../../common/select/Select2'
import dateformat from 'dateformat'
import Button from "../button/Button";

class HenkiloViewCreateKayttooikeus extends React.Component {
    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,
    };
    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
    };

    render() {
        return (
            <div className="henkiloViewUserContentWrapper">
                <div className="add-kayttooikeus-container">
                    <div className="header">
                        <p className="oph-h2 oph-bold">{this.L['HENKILO_LISAA_KAYTTOOIKEUDET_OTSIKKO']}</p>
                    </div>
                    <table>
                        <tbody >
                        <tr>
                            <td>
                                <span className="oph-bold">{this.L['HENKILO_LISAA_KAYTTOOIKEUDET_VALITSE']}</span>:
                            </td>
                            <td>
                                <Select2 name={this.L['HENKILO_KAYTTOOIKEUS_ORGANISAATIO']} data={[]} onselect={() => {}} />
                                <div>
                                    <span className="oph-bold">{' ' + this.L['HENKILO_LISAA_KAYTTOOIKEUDET_TAI']}</span>
                                </div>

                                <div>
                                    <Select2 name={this.L['HENKILO_LISAA_KAYTTOOIKEUDET_RYHMA']} data={[]} onselect={() => {}} />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span className="oph-bold">{this.L['HENKILO_LISAA_KAYTTOOIKEUDET_KESTO']}</span>:
                            </td>
                            <td>
                                <div className="kayttooikeus-input-container">
                                    <span className="oph-h5">{this.L['HENKILO_LISAA_KAYTTOOIKEUDET_ALKAA']}</span>
                                    <input className="oph-input" defaultValue={dateformat(new Date(), this.L['PVM_FORMAATTI'])}
                                           onChange={() => {}} />
                                </div>
                                <div className="kayttooikeus-input-container">
                                    <span className="oph-h5">{this.L['HENKILO_LISAA_KAYTTOOIKEUDET_PAATTYY']}</span>
                                    <input className="oph-input" defaultValue={dateformat(new Date(), this.L['PVM_FORMAATTI'])}
                                           onChange={() => {}} />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span className="oph-bold">{this.L['HENKILO_LISAA_KAYTTOOIKEUDET_MYONNETTAVAT']}</span>:
                            </td>
                            <td>
                                <Select2 name={''} data={[]} onselect={() => {}} />
                            </td>
                        </tr>
                        <tr>
                            <td />
                            <td>
                                <Button disabled action={() => {}} >{this.L['HENKILO_LISAA_KAYTTOOIKEUDET_HAE_BUTTON']}</Button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <div>
                    </div>
                </div>
            </div>
        );
    };
}

export default HenkiloViewCreateKayttooikeus;
