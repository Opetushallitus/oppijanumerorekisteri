import './HenkiloViewUserContent.css'
import React from 'react'
import Columns from 'react-columns'
import dateformat from 'dateformat'
import Field from '../field/Field';
import StaticUtils from "../StaticUtils";

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
        basicInfo2: React.PropTypes.func.isRequired,
        loginInfo: React.PropTypes.func.isRequired,
        readOnlyButtons: React.PropTypes.func.isRequired,
        editButtons: React.PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.henkiloUpdate = JSON.parse(JSON.stringify(this.props.henkilo.henkilo)); // deep copy
        this.kieliKoodis = this.props.koodisto.kieli;
        this.kansalaisuusKoodis = this.props.koodisto.kansalaisuus;
        this.sukupuoliKoodis = this.props.koodisto.sukupuoli;

        this.state = {
            readOnly: this.props.readOnly,
            showPassive: false,
            editData: [this.props.basicInfo(), this.props.basicInfo2(this.henkiloUpdate), this.props.loginInfo()],
        }
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
                                this.state.editData.map((info, idx) =>
                                    <div key={idx} className="henkiloViewContent">
                                        {info.map((values, idx2) =>
                                            !values.showOnlyOnWrite || !this.state.readOnly
                                                ?
                                                <div key={idx2} id={values.label}>
                                                    <Columns columns={2} className="labelValue" rootStyles={{marginRight: '25%'}}>
                                                        <span className="oph-bold">{L[values.label]}</span>
                                                        <Field {...values}
                                                               changeAction={!values.date
                                                                   ? this._updateModelField
                                                                   : this._updateDateField}
                                                               readOnly={values.readOnly || this.state.readOnly}>
                                                            {values.value}
                                                        </Field>
                                                    </Columns>
                                                </div>
                                                : null
                                        )}
                                    </div>
                                )
                            }
                        </Columns>
                    </div>
                {this.state.readOnly
                    ? <div className="henkiloViewButtons">
                        {this.props.readOnlyButtons(this._edit)}
                    </div>
                    : <div className="henkiloViewEditButtons">
                        {this.props.editButtons(this._discard, this._update)}
                    </div>
                }
            </div>
        )
    };

    _edit() {
        this.setState({readOnly: false});
    };

    _discard() {
        this.henkiloUpdate = JSON.parse(JSON.stringify(this.props.henkilo.henkilo)); // deep copy
        this.setState({
            readOnly: true,
        });
    };

    _update() {
        this.props.updateHenkiloAndRefetch(this.henkiloUpdate);
        if(this.henkiloUpdate.password && this.henkiloUpdate.password === this.henkiloUpdate.passwordAgain) {
            this.props.updatePassword(this.henkiloUpdate.oidHenkilo, this.henkiloUpdate.password);
            this.henkiloUpdate.password = this.henkiloUpdate.passwordAgain = null;
        }
        if(this.props.henkilo.kayttajatieto.username !== undefined && this.henkiloUpdate.kayttajanimi !== undefined) {
            this.props.updateAndRefetchKayttajatieto(this.henkiloUpdate.oidHenkilo, this.henkiloUpdate.kayttajanimi);
        }
        this.setState({readOnly: true});
    };

    _updateModelField(event) {
        const value = event.target.value;
        const fieldpath = event.target.name;
        StaticUtils.updateFieldByDotAnnotation(this.henkiloUpdate, fieldpath, value);
    };

    _updateDateField(event) {
        const value = event.target.value;
        const fieldpath = event.target.name;
        StaticUtils.updateFieldByDotAnnotation(this.henkiloUpdate, fieldpath,
            dateformat(StaticUtils.ddmmyyyyToDate(value), this.props.l10n[this.props.locale]['PVM_DBFORMAATTI']));
    };

}

export default HenkiloViewUserContent;
