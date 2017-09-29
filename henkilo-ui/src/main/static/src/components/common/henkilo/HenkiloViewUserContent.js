import './HenkiloViewUserContent.css'
import React from 'react'
import PropTypes from 'prop-types'
import Columns from 'react-columns'
import StaticUtils from "../StaticUtils";
import EditButtons from "./buttons/EditButtons";
import moment from 'moment';

class HenkiloViewUserContent extends React.Component {
    static propTypes = {
        l10n: PropTypes.object.isRequired,
        henkilo: PropTypes.shape({
            kayttajatieto: PropTypes.object.isRequired,
            henkilo: PropTypes.object.isRequired
        }).isRequired,
        readOnly: PropTypes.bool.isRequired,
        showPassive: PropTypes.bool,
        locale: PropTypes.string.isRequired,
        koodisto: PropTypes.shape({
            sukupuoli: PropTypes.array,
            kieli: PropTypes.array,
            kansalaisuus: PropTypes.kansalaisuus
        }).isRequired,
        passivoiHenkilo: PropTypes.func.isRequired,
        yksiloiHenkilo: PropTypes.func.isRequired,
        updateHenkiloAndRefetch: PropTypes.func.isRequired,

        basicInfo: PropTypes.func.isRequired,
        readOnlyButtons: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];

        this.state = {
            henkiloUpdate: JSON.parse(JSON.stringify(this.props.henkilo.henkilo)), // deep copy
            readOnly: this.props.readOnly,
            showPassive: false,
        };
    };

    render() {
        return (
            <div className="henkiloViewUserContentWrapper user-content">
                    <div>
                        <div className="header">
                            <p className="oph-h2 oph-bold">{this.L['HENKILO_PERUSTIEDOT_OTSIKKO'] + this._additionalInfo()}</p>
                        </div>
                        <Columns columns={3} gap="10px">
                            {
                                this.props.basicInfo(this.state.readOnly, this._updateModelField.bind(this),
                                    this._updateDateField.bind(this), this.state.henkiloUpdate).map((info, idx) =>
                                    <div key={idx} className="henkiloViewContent">
                                        {
                                            info.map((values, idx2) => <div key={idx2}>{values}</div>
                                        )}
                                    </div>
                                )
                            }
                        </Columns>
                    </div>
                {this.state.readOnly
                    ? <div className="henkiloViewButtons">
                        {this.props.readOnlyButtons(this._edit.bind(this)).map((button, idx) => <div style={{display: 'inline-block'}} key={idx}>{button}</div>)}
                    </div>
                    : <div className="henkiloViewEditButtons">
                        <EditButtons discardAction={this._discard.bind(this)}
                                     updateAction={this._update.bind(this)}
                                     L={this.L} />
                    </div>
                }
            </div>
        )
    };

    _edit() {
        this.setState({readOnly: false});
    };

    _additionalInfo() {
        const info = [];
        if(this.props.henkilo.henkilo.yksiloity) {
            info.push(this.L['HENKILO_ADDITIONALINFO_YKSILOITY']);
        }
        if(this.props.henkilo.henkilo.yksiloityVTJ) {
            info.push(this.L['HENKILO_ADDITIONALINFO_YKSILOITYVTJ']);
        }
        if(!this.props.henkilo.henkilo.yksiloity && !this.props.henkilo.henkilo.yksiloityVTJ) {
            info.push(this.L['HENKILO_ADDITIOINALINFO_EIYKSILOITY']);
        }
        if(this.props.henkilo.henkilo.duplicate) {
            info.push(this.L['HENKILO_ADDITIONALINFO_DUPLIKAATTI']);
        }
        return info.length ? ' (' + StaticUtils.flatArray(info) + ')' : '';
    }

    _discard() {
        this.setState({
            henkiloUpdate: JSON.parse(JSON.stringify(this.props.henkilo.henkilo)), // deep copy
            readOnly: true,
        });
    };

    _update() {
        const henkiloUpdate = Object.assign({}, this.state.henkiloUpdate);

        console.log(henkiloUpdate.syntymaaika);
        henkiloUpdate.syntymaaika = henkiloUpdate.syntymaaika.includes('.') ? moment(StaticUtils.ddmmyyyyToDate(henkiloUpdate.syntymaaika)).format(this.props.l10n[this.props.locale]['PVM_DBFORMAATTI']) : henkiloUpdate.syntymaaika;
        console.log(henkiloUpdate.syntymaaika);
        this.props.updateHenkiloAndRefetch(henkiloUpdate);
        if(this.props.henkilo.kayttajatieto.username !== undefined && henkiloUpdate.kayttajanimi !== undefined) {
            this.props.updateAndRefetchKayttajatieto(henkiloUpdate.oidHenkilo, henkiloUpdate.kayttajanimi);
        }
        this.setState({readOnly: true});
    };

    _updateModelField(event) {
        this.setState({
            henkiloUpdate: StaticUtils.updateFieldByDotAnnotation(this.state.henkiloUpdate, event),
        });
    };

    _updateDateField(event) {
        this.setState({
            henkiloUpdate: StaticUtils.updateFieldByDotAnnotation(this.state.henkiloUpdate, event)
        });
    };

}

export default HenkiloViewUserContent;
