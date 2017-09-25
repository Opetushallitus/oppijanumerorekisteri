import React from 'react';
import PropTypes from 'prop-types'
import './HenkiloViewCreateKayttooikeusanomus.css';
import OphSelect from '../select/OphSelect';
import Button from '../button/Button';
import R from 'ramda';
import {ShowText} from '../../common/ShowText';
import IconButton from "../button/IconButton";
import CrossCircleIcon from "../icons/CrossCircleIcon";
import EmailSelect from "./select/EmailSelect";
import WideBlueNotification from "../../common/notifications/WideBlueNotification";

export default class HenkiloViewCreateKayttooikeusanomus extends React.Component {

    static propTypes = {
        l10n: PropTypes.object.isRequired,
        locale: PropTypes.string.isRequired,
        omattiedot: PropTypes.object.isRequired,
        organisaatios: PropTypes.object.isRequired,
        ryhmas: PropTypes.object.isRequired,
        henkilo: PropTypes.object.isRequired,
        organisaatioOptions: PropTypes.array.isRequired,
        ryhmaOptions: PropTypes.array.isRequired,
        kayttooikeusryhmaOptions: PropTypes.array.isRequired,
        fetchOrganisaatioKayttooikeusryhmat: PropTypes.func.isRequired
    };

    constructor() {
        super();

        this.state = {
            organisaatioSelection: '',
            ryhmaSelection: '',
            emailSelection: '',
            kayttooikeusryhmaSelections: [],
            perustelut: '',
            kayttooikeusryhmaOptions: [],
            organisaatioOptions: [],
        }
    }

    componentWillReceiveProps(nextProps) {
        const emailOptions = this._parseEmailOptions(nextProps.henkilo);
        if (emailOptions.length === 1) {
            this.setState({
                emailSelection: emailOptions[0].value,
                missingEmail: false,
                showMissingEmailNotification: false
            });
        } else if (emailOptions.length > 1) {
            this.setState({missingEmail: false, showMissingEmailNotification: false, emailSelection: ''});
        } else {
            this.setState({missingEmail: true, showMissingEmailNotification: true});
        }
        this.setState({emailOptions});
    }

    render() {
        const L = this.props.l10n[this.props.locale];
        const kayttooikeusRyhmaOptions = this.props.kayttooikeusryhmaOptions.filter(option => R.findIndex(R.propEq('value', option.value), this.state.kayttooikeusryhmaSelections) < 0);

        return (<div className="kayttooikeus-anomus-wrapper">
            <span className="oph-h2 oph-bold">{L['OMATTIEDOT_OTSIKKO']}</span>
            {this.state.showMissingEmailNotification ?
                <WideBlueNotification message={L['OMATTIEDOT_PUUTTUVA_SAHKOPOSTI_UUSI_ANOMUS']} closeAction={() => {
                    this.setState({showMissingEmailNotification: false})
                }}/> : null}

            <div>
                <div className="oph-field oph-field-inline">
                    <label className="oph-label oph-bold oph-label-long" aria-describedby="field-text">
                        {L['OMATTIEDOT_ORGANISAATIO_TAI_RYHMA']}*
                    </label>
                    <div className="oph-input-container">
                        <OphSelect noResultsText={`${L['SYOTA_VAHINTAAN']} 3 ${L['MERKKIA']}`}
                                   placeholder={L['OMATTIEDOT_ORGANISAATIO']}
                                   onChange={this._changeOrganisaatioSelection.bind(this)}
                                   onBlurResetsInput={false}
                                   options={this.state.organisaatioOptions}
                                   onInputChange={this.inputChange.bind(this)}
                                   value={this.state.organisaatioSelection}
                                   disabled={this.state.showMissingEmailNotification} />
                    </div>
                </div>

                <div className="oph-field oph-field-inline">
                    <label className="oph-label otph-bold oph-label-long" aria-describedby="field-text"/>
                    <div className="oph-input-container">
                        <OphSelect onChange={this._changeRyhmaSelection.bind(this)}
                                   options={this.props.ryhmaOptions}
                                   value={this.state.ryhmaSelection}
                                   placeholder={L['OMATTIEDOT_ANOMINEN_RYHMA']}
                                   disabled={this.state.showMissingEmailNotification} />
                    </div>
                </div>

                {this.state.emailOptions && this.state.emailOptions.length > 1 ?
                    <div className="oph-field oph-field-inline">
                        <label className="oph-label oph-bold oph-label-long" htmlFor="email"
                               aria-describedby="field-text">
                            {L['OMATTIEDOT_SAHKOPOSTIOSOITE']}*
                        </label>

                        <EmailSelect changeEmailAction={this._changeEmail.bind(this)}
                                     emailSelection={this.state.emailSelection}
                                    emailOptions={this.state.emailOptions}/>
                    </div> : null
                }


                <div className="oph-field oph-field-inline">
                    <label className="oph-label oph-bold oph-label-long" aria-describedby="field-text">
                        {L['OMATTIEDOT_ANOTTAVAT']}*
                    </label>

                    <div className="oph-input-container kayttooikeus-selection-wrapper">

                        <OphSelect placeholder={L['OMATTIEDOT_ANOMINEN_KAYTTOOIKEUS']}
                                noResultsText={L['OMATTIEDOT_ANOMINEN_OHJE']}
                                options={kayttooikeusRyhmaOptions}
                                onChange={this._addKayttooikeusryhmaSelection.bind(this)}
                                disabled={this.state.showMissingEmailNotification} />

                        <ul className="selected-permissions">
                            {this.state.kayttooikeusryhmaSelections.map((kayttooikeusRyhmaSelection, index) => {
                                return (
                                    <li key={index}>
                                        {kayttooikeusRyhmaSelection.label}
                                        <IconButton
                                            onClick={this._removeKayttooikeusryhmaSelection.bind(this, kayttooikeusRyhmaSelection)}>
                                            <CrossCircleIcon/>
                                        </IconButton>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>

                <div className="oph-field oph-field-inline">
                    <label className="oph-label oph-bold oph-label-long" htmlFor="perustelut"
                           aria-describedby="field-text">
                        {L['OMATTIEDOT_PERUSTELUT']}
                    </label>

                    <div className="oph-input-container">
                    <textarea className="oph-input"
                              value={this.state.perustelut}
                              onChange={this._changePerustelut.bind(this)}
                              name="perustelut"
                              id="perustelut"
                              cols="30"
                              rows="10"
                              disabled={this.state.showMissingEmailNotification} />
                    </div>
                </div>

                <div className="oph-field oph-field-inline">
                    <label className="oph-label otph-bold oph-label-long" aria-describedby="field-text"/>
                    <div className="oph-input-container">
                        <div className="anomus-button">
                            <Button action={this._createKayttooikeusAnomus.bind(this)}
                                    disabled={!this._isAnomusButtonDisabled()}>{L['OMATTIEDOT_HAE_BUTTON']}</Button>
                        </div>
                        <div className="anomus-requirements">
                            <ShowText show={!this._validOrganisaatioOrRyhmaSelection()}><p>
                                !{L['OMATTIEDOT_VAATIMUS_ORGANISAATIO']}</p></ShowText>
                            <ShowText show={this.state.emailOptions && this.state.emailOptions.length > 1 && !this._validEmailSelection()}><p>!{L['OMATTIEDOT_VAATIMUS_EMAIL']}</p>
                            </ShowText>
                            <ShowText show={!this._validKayttooikeusryhmaSelection()}><p>
                                !{L['OMATTIEDOT_VAATIMUS_KAYTTOOIKEUDET']}</p></ShowText>
                        </div>
                    </div>

                </div>

            </div>
        </div>);
    }

    _changeEmail(value) {
        this.setState({emailSelection: value});
    }

    _changePerustelut(event) {
        this.setState({perustelut: event.target.value});
    }

    _changeOrganisaatioSelection(selection) {
        this.setState({organisaatioSelection: selection.value, ryhmaSelection: '', kayttooikeusryhmaSelections: [], organisaatioOptions: [selection]});
        this.props.fetchOrganisaatioKayttooikeusryhmat(selection.value);
    }

    _changeRyhmaSelection(selection) {
        this.setState({ryhmaSelection: selection.value, organisaatioSelection: '', kayttooikeusryhmaSelections: []});
        this.props.fetchOrganisaatioKayttooikeusryhmat(selection.value);
    }

    inputChange(value) {
        if (value.length >= 3) {
            this.setState({
                organisaatioOptions: this.props.organisaatioOptions.filter(organisaatioOption => organisaatioOption.label.toLowerCase().indexOf(value) >= 0)
            });
        } else {
            this.setState({organisaatioOptions: []});
        }
    }

    _isAnomusButtonDisabled() {
        return this._validOrganisaatioOrRyhmaSelection() &&
            this._validKayttooikeusryhmaSelection() &&
            this._validEmailSelection();
    }

    _validOrganisaatioOrRyhmaSelection() {
        return this.state.organisaatioSelection !== '' || this.state.ryhmaSelection !== '';
    }

    _validKayttooikeusryhmaSelection() {
        return this.state.kayttooikeusryhmaSelections.length > 0;
    }

    _validEmailSelection() {
        return this.state.emailSelection !== '' && !this.state.missingEmail;
    }

    _resetAnomusFormFields() {
        this.setState({
            organisaatioSelection: '',
            ryhmaSelection: '',
            emailSelection: '',
            kayttooikeusryhmaSelections: [],
            tehtavanimike: '',
            perustelut: ''
        });
    }

    _parseEmailOptions(henkilo) {
        let emails = [];
        if (henkilo.henkilo.yhteystiedotRyhma) {
            henkilo.henkilo.yhteystiedotRyhma.forEach(yhteystietoRyhma => {
                yhteystietoRyhma.yhteystieto.forEach(yhteys => {
                    if (yhteys.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI') {
                        emails.push(yhteys.yhteystietoArvo);
                    }
                })
            });
        }

        return emails.map(email => ({value: email, label: email}));
    };

    _addKayttooikeusryhmaSelection(kayttooikeusryhmaSelection) {
        const kayttooikeusryhmaSelections = this.state.kayttooikeusryhmaSelections;
        kayttooikeusryhmaSelections.push(kayttooikeusryhmaSelection);
        this.setState({kayttooikeusryhmaSelections: kayttooikeusryhmaSelections});
    }

    _removeKayttooikeusryhmaSelection(kayttooikeusryhmaSelection) {
        const kayttooikeusryhmaSelections = this.state.kayttooikeusryhmaSelections.filter(selection => selection.value !== kayttooikeusryhmaSelection.value);
        this.setState({kayttooikeusryhmaSelections});
    }

    async _createKayttooikeusAnomus() {
        const kayttooikeusRyhmaIds = R.map(selection => (R.view(R.lensProp('value'), selection)), this.state.kayttooikeusryhmaSelections);
        const anomusData = {
            organisaatioOrRyhmaOid: this.state.organisaatioSelection || this.state.ryhmaSelection,
            email: this.state.emailSelection,
            perustelut: this.state.perustelut,
            kayttooikeusRyhmaIds,
            anojaOid: this.props.omattiedot.data.oid
        };
        await this.props.createKayttooikeusanomus(anomusData);
        this._resetAnomusFormFields();
        this.props.fetchAllKayttooikeusAnomusForHenkilo(this.props.omattiedot.data.oid);

    }

}