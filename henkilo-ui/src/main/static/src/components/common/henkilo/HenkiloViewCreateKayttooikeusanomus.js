import React from 'react';
import './HenkiloViewCreateKayttooikeusanomus.css';
import OphSelect from '../select/OphSelect';
import Button from '../button/Button';
import R from 'ramda';

export default class HenkiloViewCreateKayttooikeusanomus extends React.Component {

    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,
        omattiedot: React.PropTypes.object.isRequired,
        organisaatios: React.PropTypes.object.isRequired,
        ryhmas: React.PropTypes.object.isRequired,
        henkilo: React.PropTypes.object.isRequired,
        organisaatioOptions: React.PropTypes.array.isRequired,
        ryhmaOptions: React.PropTypes.array.isRequired,
        kayttooikeusryhmaOptions: React.PropTypes.array.isRequired,
        fetchOrganisaatioKayttooikeusryhmat: React.PropTypes.func.isRequired
    };

    constructor() {
        super();

        this.state = {
            organisaatioSelection: '',
            ryhmaSelection: '',
            emailSelection: '',
            kayttooikeusryhmaSelection: [],
            kayttooikeusryhmaOptions: [],
            organisaatioOptions: [],
            emailOptions: [],
            tehtavanimike: '',
        }
    }

    componentDidMount() {
        this.setState({
            emailOptions: this._parseEmailOptions(this.props.henkilo),
        });
    }

    render() {
        const L = this.props.l10n[this.props.locale];
        return (<div className="kayttooikeus-anomus-wrapper">
            <h2 className="oph-h2 oph-bold">{L['OMATTIEDOT_OTSIKKO']}</h2>

            <div className="oph-field oph-field-inline">
                <label className="oph-label oph-bold oph-label-long" aria-describedby="field-text">
                    {L['OMATTIEDOT_ORGANISAATIO_TAI_RYHMA']}
                </label>
                <div className="oph-input-container">
                    <OphSelect noResultsText={ `${L['SYOTA_VAHINTAAN']} 3 ${L['MERKKIA']}` }
                               placeholder={L['OMATTIEDOT_ORGANISAATIO']}
                               onChange={this._changeOrganisaatioSelection.bind(this)}
                               onBlurResetsInput={false}
                               options={this.state.organisaatioOptions}
                               onInputChange={this.inputChange.bind(this)}
                               value={this.state.organisaatioSelection}></OphSelect>
                </div>

            </div>

            <div className="oph-field oph-field-inline">
                <label className="oph-label otph-bold oph-label-long" aria-describedby="field-text"></label>
                <div className="oph-input-container">
                    <OphSelect onChange={this._changeRyhmaSelection.bind(this)}
                               options={this.props.ryhmaOptions}
                               value={this.state.ryhmaSelection}
                               placeholder={L['OMATTIEDOT_ANOMINEN_RYHMA']}></OphSelect>
                </div>
            </div>

            <div className="oph-field oph-field-inline">
                <label className="oph-label oph-bold oph-label-long" htmlFor="tehtavanimike"
                       aria-describedby="field-text">
                    {L['OMATTIEDOT_TEHTAVANIMIKE']}
                </label>

                <div className="oph-input-container">
                    <input id="tehtavanimike" className="oph-input" value={this.state.tehtavanimike}
                           onChange={this._changeTehtavanimike.bind(this)} type="text"/>
                </div>
            </div>


            <div className="oph-field oph-field-inline">
                <label className="oph-label oph-bold oph-label-long" htmlFor="email" aria-describedby="field-text">
                    {L['OMATTIEDOT_SAHKOPOSTIOSOITE']}
                </label>

                <div className="oph-input-container">
                    <OphSelect placeholder={L['OMATTIEDOT_SAHKOPOSTI_VALINTA']}
                               options={this.state.emailOptions}
                               value={this.state.emailSelection}
                               onChange={this._changeEmail.bind(this)}
                               onInputChange={this._changeEmailInput.bind(this)}
                               onBlurResetsInput={false}
                               onInputKeyDown={this._changeEmailEnterKey.bind(this)}
                               noResultsText={L['OMATTIEDOT_KIRJOITA_SAHKOPOSTI']}
                    ></OphSelect>
                </div>

            </div>

            <div className="oph-field oph-field-inline">
                <label className="oph-label oph-bold oph-label-long" aria-describedby="field-text">
                    {L['OMATTIEDOT_ANOTTAVAT']}
                </label>

                <div className="oph-input-container">
                    <OphSelect placeholder={L['OMATTIEDOT_ANOMINEN_KAYTTOOIKEUS']}
                               noResultsText={L['OMATTIEDOT_ANOMINEN_OHJE']}
                               options={this.props.kayttooikeusryhmaOptions}
                               multi
                               value={this.state.kayttooikeusryhmaSelection}
                               onChange={this._changeKayttooikeusryhmaSelection.bind(this)}
                    ></OphSelect>
                </div>
            </div>

            <div className="oph-field oph-field-inline">
                <label className="oph-label oph-bold oph-label-long" htmlFor="perustelut" aria-describedby="field-text">
                    {L['OMATTIEDOT_PERUSTELUT']}
                </label>

                <div className="oph-input-container">
                    <textarea className="oph-input" value={this.state.perustelut}
                              onChange={this._changePerustelut.bind(this)} name="perustelut" id="perustelut" cols="30"
                              rows="10"></textarea>
                </div>
            </div>

            <div className="oph-field oph-field-inline">
                <label className="oph-label otph-bold oph-label-long" aria-describedby="field-text"></label>
                <div className="oph-input-container">
                   <Button action={this._createKayttooikeusAnomus.bind(this)} disabled={!this._isAnomusButtonDisabled()}>{L['OMATTIEDOT_HAE_BUTTON']}</Button>
                </div>

            </div>

        </div>);
    }

    _changeEmail(value) {
        this.setState({emailSelection: value});
    }

    _changeEmailEnterKey(event) {
        if(event.keyCode === 13) {
            const emailOptions = this.state.emailOptions;
            const newEmail = event.target.value;
            emailOptions.push({value: newEmail, label: newEmail});
            this.setState({emailOptions: emailOptions, emailSelection: newEmail.value});
        }
    }

    _changeEmailInput(value) {
        this.setState({emailSelection: '', newEmail: value});
    }

    _changeTehtavanimike(event) {
        this.setState({tehtavanimike: event.target.value});
    }

    _changePerustelut(event) {
        this.setState({perustelut: event.target.value});
    }

    _changeOrganisaatioSelection(selection) {
        this.setState({organisaatioSelection: selection.value, ryhmaSelection: '', kayttooikeusryhmaSelection: []});
        this.props.fetchOrganisaatioKayttooikeusryhmat(selection.value);
    }

    _changeRyhmaSelection(selection) {
        this.setState({ryhmaSelection: selection.value, organisaatioSelection: '', kayttooikeusryhmaSelection: []});
        this.props.fetchOrganisaatioKayttooikeusryhmat(selection.value);
    }

    _changeKayttooikeusryhmaSelection(selection) {
        this.setState({kayttooikeusryhmaSelection: selection});
    }

    _parseEmailOptions(henkilo) {
        let emails = [];
        henkilo.henkilo.yhteystiedotRyhma.forEach(yhteystietoRyhma => {
            yhteystietoRyhma.yhteystieto.forEach(yhteys => {
                if (yhteys.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI') {
                    emails.push(yhteys.yhteystietoArvo);
                }
            })
        });
        return emails.map(email => ({value: email, label: email}));
    }

    inputChange(value) {
        if (value.length >= 3) {
            this.setState({
                organisaatioOptions: this.props.organisaatioOptions.filter(
                    organisaatioOption => organisaatioOption.label.indexOf(value) > 0
                )
            });
        } else {
            this.setState({organisaatioOptions: []});
        }
    }

    _isAnomusButtonDisabled() {
        const organisaatioOrRyhmaSelected = this.state.organisaatioSelection !== '' || this.state.ryhmaSelection !== '';
        const ryhmaSelected = this.state.kayttooikeusryhmaSelection.length > 0;
        const emailSelected = this.state.emailSelection.value !== undefined;
        return organisaatioOrRyhmaSelected && ryhmaSelected && emailSelected;
    }

    _createKayttooikeusAnomus() {
        const kayttooikeusRyhmaIds = R.map( selection => (R.view(R.lensProp('value'), selection)), this.state.kayttooikeusryhmaSelection);
        const anomusData = {
            organisaatioOrRyhmaOid: this.state.organisaatioSelection || this.state.ryhmaSelection,
            email: this.state.emailSelection.value,
            tehtavaNimike: this.state.tehtavanimike,
            perustelut: this.state.perustelut,
            kayttooikeusRyhmaIds,
            anojaOid: this.props.omattiedot.data.oid
        };
        this.props.createKayttooikeusanomus(anomusData);
    }

}