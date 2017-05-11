import './HenkiloViewUserContent.css'
import React from 'react'
import Columns from 'react-columns'
import dateformat from 'dateformat'
import StaticUtils from "../StaticUtils";
import EditButtons from "./buttons/EditButtons";

class HenkiloViewUserContent extends React.Component{
    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        henkilo: React.PropTypes.shape({
            kayttajatieto: React.PropTypes.object.isRequired,
            henkilo: React.PropTypes.object.isRequired
        }).isRequired,
        readOnly: React.PropTypes.bool.isRequired,
        showPassive: React.PropTypes.bool,
        locale: React.PropTypes.string.isRequired,
        koodisto: React.PropTypes.shape({
            sukupuoli: React.PropTypes.array,
            kieli: React.PropTypes.array,
            kansalaisuus: React.PropTypes.kansalaisuus
        }).isRequired,
        updatePassword: React.PropTypes.func.isRequired,
        passivoiHenkilo: React.PropTypes.func.isRequired,
        yksiloiHenkilo: React.PropTypes.func.isRequired,
        updateHenkiloAndRefetch: React.PropTypes.func.isRequired,

        basicInfo: React.PropTypes.func.isRequired,
        readOnlyButtons: React.PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            henkiloUpdate: JSON.parse(JSON.stringify(this.props.henkilo.henkilo)), // deep copy
            readOnly: this.props.readOnly,
            showPassive: false,
        };
    };

    render() {
        const L = this.props.l10n[this.props.locale];
        return (
            <div className="henkiloViewUserContentWrapper">
                    <div>
                        <div className="header">
                            <p className="oph-h2 oph-bold">{L['HENKILO_PERUSTIEDOT_OTSIKKO']}</p>
                        </div>
                        <Columns columns={3} gap="10px">
                            {
                                this.props.basicInfo(this.state.readOnly, this._updateModelField.bind(this),
                                    this._updateDateField.bind(this), this.state.henkiloUpdate).map((info, idx) =>
                                    <div key={idx} className="henkiloViewContent">
                                        {
                                            info.map((values, idx2) => values
                                        )}
                                    </div>
                                )
                            }
                        </Columns>
                    </div>
                {this.state.readOnly
                    ? <div className="henkiloViewButtons">
                        {this.props.readOnlyButtons(this._edit.bind(this))}
                    </div>
                    : <div className="henkiloViewEditButtons">
                        <EditButtons discardAction={this._discard.bind(this)} updateAction={this._update.bind(this)} L={L} />
                    </div>
                }
            </div>
        )
    };

    _edit() {
        this.setState({readOnly: false});
    };

    _discard() {
        this.setState({
            henkiloUpdate: JSON.parse(JSON.stringify(this.props.henkilo.henkilo)), // deep copy
            readOnly: true,
        });
    };

    _update() {
        this.props.updateHenkiloAndRefetch(this.state.henkiloUpdate);
        if(this.state.henkiloUpdate.password && this.state.henkiloUpdate.password === this.state.henkiloUpdate.passwordAgain) {
            this.props.updatePassword(this.state.henkiloUpdate.oidHenkilo, this.state.henkiloUpdate.password);
            this.state.henkiloUpdate.password = this.state.henkiloUpdate.passwordAgain = null;
        }
        if(this.props.henkilo.kayttajatieto.username !== undefined && this.state.henkiloUpdate.kayttajanimi !== undefined) {
            this.props.updateAndRefetchKayttajatieto(this.state.henkiloUpdate.oidHenkilo, this.state.henkiloUpdate.kayttajanimi);
        }
        this.setState({readOnly: true});
    };

    _updateModelField(event) {
        let value;
        let fieldpath;
        if(event.optionsName) {
            value = event.value;
            fieldpath = event.optionsName;
        }
        else {
            value = event.target.value;
            fieldpath = event.target.name;
        }
        this.setState({
            henkiloUpdate: StaticUtils.updateFieldByDotAnnotation(this.state.henkiloUpdate, fieldpath, value),
        });
    };

    _updateDateField(event) {
        const value = event.target.value;
        const fieldpath = event.target.name;
        this.setState({
            henkiloUpdate: StaticUtils.updateFieldByDotAnnotation(this.state.henkiloUpdate, fieldpath,
                dateformat(StaticUtils.ddmmyyyyToDate(value), this.props.l10n[this.props.locale]['PVM_DBFORMAATTI'])),
        });
    };

}

export default HenkiloViewUserContent;
