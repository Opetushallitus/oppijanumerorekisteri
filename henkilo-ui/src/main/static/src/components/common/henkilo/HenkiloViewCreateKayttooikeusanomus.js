import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import './HenkiloViewCreateKayttooikeusanomus.css';
import OphSelect from '../select/OphSelect';
import Button from '../button/Button';
import * as R from 'ramda';
import {ShowText} from '../../common/ShowText';
import IconButton from '../button/IconButton';
import CrossCircleIcon from '../icons/CrossCircleIcon';
import EmailSelect from './select/EmailSelect';
import WideBlueNotification from "../../common/notifications/WideBlueNotification";
import KayttooikeusryhmaSelectModal from '../select/KayttooikeusryhmaSelectModal'
import Loader from "../icons/Loader";
import {
    createKayttooikeusanomus,
    fetchOrganisaatioKayttooikeusryhmat
} from "../../../actions/kayttooikeusryhma.actions";
import {OrganisaatioSelectModal} from "../select/OrganisaatioSelectModal";
import type {OrganisaatioSelectObject} from "../../../types/organisaatioselectobject.types";
import {organisaatioHierarkiaToOrganisaatioSelectObject} from "../../../utilities/organisaatio.util";
import {locale} from "../../../reducers/locale.reducer";

class HenkiloViewCreateKayttooikeusanomus extends React.Component {

    static propTypes = {
        l10n: PropTypes.object.isRequired,
        locale: PropTypes.string.isRequired,
        omattiedot: PropTypes.object.isRequired,
        organisaatios: PropTypes.object.isRequired,
        ryhmas: PropTypes.object.isRequired,
        henkilo: PropTypes.object.isRequired,
        ryhmaOptions: PropTypes.array.isRequired,
        kayttooikeusryhmat: PropTypes.array.isRequired,
        fetchOrganisaatioKayttooikeusryhmat: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            organisaatioSelection: '',
            organisaatioSelectionName: '',
            ryhmaSelection: '',
            kayttooikeusryhmaSelections: [],
            perustelut: '',
            emailOptions: HenkiloViewCreateKayttooikeusanomus.createEmailOptions(props.henkilo),
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({emailOptions: HenkiloViewCreateKayttooikeusanomus.createEmailOptions(nextProps.henkilo)});
    }

    static createEmailOptions(henkilo) {
        const emailOptions = HenkiloViewCreateKayttooikeusanomus._parseEmailOptions(henkilo);
        if (emailOptions.length === 1) {
            return {
                emailSelection: emailOptions[0].value,
                missingEmail: false,
                showMissingEmailNotification: false
            };
        }
        else if (emailOptions.length > 1) {
            return {missingEmail: false, showMissingEmailNotification: false, emailSelection: '', options: emailOptions};
        }
        return {missingEmail: true, showMissingEmailNotification: true};
    }

    render() {
        const L = this.props.l10n[this.props.locale];
        const kayttooikeusryhmaSelections = this.state.kayttooikeusryhmaSelections.map(selection => {return {id: selection.value}})
        const kayttooikeusryhmat = this.props.kayttooikeusryhmat.filter(kayttooikeusryhma => R.findIndex(R.propEq('id', kayttooikeusryhma.id), kayttooikeusryhmaSelections) < 0);

        return this.props.henkilo.henkiloLoading
            ? <Loader />
            :(<div className="kayttooikeus-anomus-wrapper">
                <div className="header">
                    <span className="oph-h2 oph-bold">{L['OMATTIEDOT_OTSIKKO']}</span>
                </div>
                {this.state.emailOptions.showMissingEmailNotification ?
                    <WideBlueNotification message={L['OMATTIEDOT_PUUTTUVA_SAHKOPOSTI_UUSI_ANOMUS']} closeAction={() => {
                        this.setState(
                            {...this.state,
                                emailOptions: {
                                    ...this.state.emailOptions,
                                    showMissingEmailNotification: false,
                                }
                            })
                    }}/> : null}

                <div>
                    <div className="oph-field oph-field-inline">
                        <label className="oph-label oph-bold oph-label-long" aria-describedby="field-text">
                            {L['OMATTIEDOT_ORGANISAATIO_TAI_RYHMA']}*
                        </label>

                        <div className="oph-input-container flex-horizontal">
                            <input className="oph-input flex-item-1 kutsutut-organisaatiosuodatus" type="text"
                                   value={this.state.organisaatioSelectionName}
                                   placeholder={L['OMATTIEDOT_VALITSE_ORGANISAATIO']} readOnly/>
                            <OrganisaatioSelectModal
                                locale={this.props.locale}
                                L={L}
                                organisaatiot={this._parseOrganisaatioSelectOptions.call(this, this.props.organisaatios)}
                                onSelect={this._changeOrganisaatioSelection.bind(this)}
                                disabled={this.props.organisaatios.organisaatioHierarkiaLoading}
                            />
                        </div>
                    </div>

                    <div className="oph-field oph-field-inline">
                        <label className="oph-label otph-bold oph-label-long" aria-describedby="field-text"/>
                        <div className="oph-input-container">
                            <OphSelect onChange={this._changeRyhmaSelection.bind(this)}
                                       options={this.props.ryhmaOptions}
                                       value={this.state.ryhmaSelection}
                                       placeholder={L['OMATTIEDOT_ANOMINEN_RYHMA']}
                                       disabled={this.state.emailOptions.missingEmail} />
                        </div>
                    </div>

                    {this.state.emailOptions.options && this.state.emailOptions.options.length > 1 ?
                        <div className="oph-field oph-field-inline">
                            <label className="oph-label oph-bold oph-label-long" htmlFor="email"
                                   aria-describedby="field-text">
                                {L['OMATTIEDOT_SAHKOPOSTIOSOITE']}*
                            </label>

                            <EmailSelect changeEmailAction={this._changeEmail.bind(this)}
                                         emailSelection={this.state.emailOptions.emailSelection}
                                         emailOptions={this.state.emailOptions.options}/>
                        </div> : null
                    }


                    <div className="oph-field oph-field-inline">
                        <label className="oph-label oph-bold oph-label-long" aria-describedby="field-text">
                            {L['OMATTIEDOT_ANOTTAVAT']}*
                        </label>

                        <div className="oph-input-container kayttooikeus-selection-wrapper">

                            <KayttooikeusryhmaSelectModal
                                locale={this.props.locale}
                                L={L}
                                kayttooikeusryhmat={kayttooikeusryhmat}
                                onSelect={this._addKayttooikeusryhmaSelection.bind(this)}
                                disabled={kayttooikeusryhmat.length === 0 || this.state.emailOptions.missingEmail}
                            />
                        </div>
                    </div>

                    <div className="oph-field oph-field-inline">
                        <label className="oph-label oph-bold oph-label-long" aria-describedby="field-text">
                        </label>
                        <div className="oph-input-container">
                            <ul className="selected-permissions">
                                {this.state.kayttooikeusryhmaSelections.map((kayttooikeusRyhmaSelection, index) => {
                                    return (
                                        <li key={index}>
                                            <div className="selected-permissions-name">
                                                {kayttooikeusRyhmaSelection.label}
                                                <IconButton
                                                    onClick={this._removeKayttooikeusryhmaSelection.bind(this, kayttooikeusRyhmaSelection)}>
                                                    <CrossCircleIcon/>
                                                </IconButton>
                                            </div>
                                            {kayttooikeusRyhmaSelection.description &&
                                            <div className="selected-permissions-description">
                                                {kayttooikeusRyhmaSelection.description}
                                            </div>
                                            }
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
                              disabled={this.state.emailOptions.missingEmail} />
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
        this.setState({
            emailOptions: {
                ...this.state.emailOptions,
                emailSelection: value,
            },
        });
    }

    _changePerustelut(event) {
        this.setState({perustelut: event.target.value});
    }

    _changeOrganisaatioSelection(organisaatio: OrganisaatioSelectObject) {
        this.setState({organisaatioSelection: organisaatio.oid, ryhmaSelection: '', kayttooikeusryhmaSelections: [], organisaatioSelectionName: organisaatio.name});
        this.props.fetchOrganisaatioKayttooikeusryhmat(organisaatio.oid);
    }

    _changeRyhmaSelection(selection) {
        this.setState({ryhmaSelection: selection.value, organisaatioSelection: '', kayttooikeusryhmaSelections: [], organisaatioSelectionName: ''});
        this.props.fetchOrganisaatioKayttooikeusryhmat(selection.value);
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
        return this.state.emailSelection !== '' && !this.state.emailOptions.missingEmail;
    }

    _parseOrganisaatioSelectOptions(organisaatioState) {
        return !organisaatioState.organisaatioHierarkiaLoading && organisaatioState.organisaatioHierarkia && organisaatioState.organisaatioHierarkia.organisaatiot.length > 0 ?
            organisaatioHierarkiaToOrganisaatioSelectObject(organisaatioState.organisaatioHierarkia.organisaatiot, locale) : [];
    }

    _resetAnomusFormFields() {
        this.setState({
            organisaatioSelection: '',
            organisaatioSelectionName: '',
            ryhmaSelection: '',
            kayttooikeusryhmaSelections: [],
            tehtavanimike: '',
            perustelut: '',
            emailOptions: HenkiloViewCreateKayttooikeusanomus.createEmailOptions(this.props.henkilo),
        });
    }

    static _parseEmailOptions(henkilo) {
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

    _addKayttooikeusryhmaSelection(kayttooikeusryhma) {
        const locale = this.props.locale.toUpperCase();
        const kayttooikeusryhmaSelection = {
            value: kayttooikeusryhma.id,
            label: R.path(['text'], R.find(R.propEq('lang', locale))(kayttooikeusryhma.nimi.texts)),
            description: R.path(['text'], R.find(R.propEq('lang', locale))(kayttooikeusryhma.kuvaus ? kayttooikeusryhma.kuvaus.texts : [])),
        };

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
            email: this.state.emailOptions.emailSelection,
            perustelut: this.state.perustelut,
            kayttooikeusRyhmaIds,
            anojaOid: this.props.omattiedot.data.oid
        };
        await this.props.createKayttooikeusanomus(anomusData);
        this._resetAnomusFormFields();
        this.props.fetchAllKayttooikeusAnomusForHenkilo(this.props.omattiedot.data.oid);
    }

}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps, {fetchOrganisaatioKayttooikeusryhmat, createKayttooikeusanomus})(HenkiloViewCreateKayttooikeusanomus);
