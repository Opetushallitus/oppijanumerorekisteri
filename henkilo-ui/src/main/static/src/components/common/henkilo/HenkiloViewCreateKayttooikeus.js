import './HenkiloViewCreateKayttooikeus.css'
import React from 'react'
import AbstractViewContainer from "../../../containers/henkilo/AbstractViewContainer"
import StaticUtils from "../StaticUtils"
import dateformat from 'dateformat';
import scrollToComponent from 'react-scroll-to-component'

class HenkiloViewCreateKayttooikeus extends AbstractViewContainer {
    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,
        henkilo: React.PropTypes.shape({henkiloOrganisaatios: React.PropTypes.array.isRequired,}),
        kayttooikeus: React.PropTypes.shape({allowedKayttooikeus: React.PropTypes.object}),
        existingKayttooikeusRef: React.PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
        this.initialKayttooikeusModel = () => ({
            kayttokohdeOrganisationOid: '',
            myonnettavatOikeudet: [],
            alkupvm: new Date(),
            loppupvm: StaticUtils.datePlusOneYear(new Date()),
        });
        this.initialState = {
            selectedList: [],
            validationMessages: [{id: 'organisation', label: 'HENKILO_LISAA_KAYTTOOIKEUDET_ORGANISAATIO_VALID'},
                {id: 'kayttooikeus', label: 'HENKILO_LISAA_KAYTTOOIKEUDET_KAYTTOOIKEUS_VALID'}],
            kayttooikeusData: [],
        };
        this.kayttooikeusModel = this.initialKayttooikeusModel();
        this.KO_TEMP_INITIALDATA = [{value: 'id', label: 'text'}, {value: 'id2', label: 'text2'}];

        this.organisationAction = (value) => {
            this.kayttooikeusModel.kayttokohdeOrganisationOid = value.value;
            this.setState({
                validationMessages: this.state.validationMessages.filter(
                    validationMessage => validationMessage.id !== 'organisation'),
            });
            this.props.fetchAllowedKayttooikeusryhmasForOrganisation(this.props.oidHenkilo, value.value);
        };

        this.kayttooikeudetAction = (value) => {
            if(value.value !== '') {
                this.setState({
                    selectedList: [...this.state.selectedList, value],
                });
            }
            this.setState({
                validationMessages: this.state.validationMessages.filter(
                    validationMessage => validationMessage.id !== 'kayttooikeus'),
            });
        };

        this.close = (kayttooikeusId) => {
            const selectedList = this.state.selectedList.filter(selected => selected.value !== kayttooikeusId);
            const id = 'kayttooikeus';
            const label = 'HENKILO_LISAA_KAYTTOOIKEUDET_KAYTTOOIKEUS_VALID';
            let newState = { selectedList, };
            if(this.state.validationMessages.filter(validationMessage => validationMessage.id === id)[0] === undefined
                && !selectedList.length) {
                newState = Object.assign(newState, { validationMessages: [...this.state.validationMessages, {id, label}],});
            }
            this.setState(newState);
        };

        this.kestoAlkaaAction = (event) => {
            this.kayttooikeusModel.alkupvm = StaticUtils.ddmmyyyyToDate(event.target.value);
        };

        this.kestoPaattyyAction = (event) => {
            this.kayttooikeusModel.loppupvm = StaticUtils.ddmmyyyyToDate(event.target.value);
        };

        this.createKayttooikeusAction = () => {
            this.props.addKayttooikeusToHenkilo(this.props.oidHenkilo, this.kayttooikeusModel.kayttokohdeOrganisationOid,
                this.state.selectedList.map(selected => ({
                    id: selected.value,
                    kayttoOikeudenTila: 'MYONNA',
                    alkupvm: dateformat(this.kayttooikeusModel.alkupvm, this.L['PVM_DBFORMAATTI']),
                    loppupvm: dateformat(this.kayttooikeusModel.loppupvm, this.L['PVM_DBFORMAATTI']),
                })));
            // clear
            this.kayttooikeusModel = this.initialKayttooikeusModel();
            this.setState(this.initialState);
            // Scroll
            scrollToComponent(this.props.existingKayttooikeusRef);
        };

        this.state = this.initialState;
    };

    render() {
        return (
            <div className="henkiloViewUserContentWrapper">
                <div className="add-kayttooikeus-container">
                    <div className="header">
                        <p className="oph-h2 oph-bold">{this.L['HENKILO_LISAA_KAYTTOOIKEUDET_OTSIKKO']}</p>
                    </div>
                    <div>
                    {
                        this.createKayttooikeusFields(
                            this.createKayttooikeusKohdeField(this.props.henkilo.henkiloOrganisaatios, this.organisationAction,
                                this.kayttooikeusModel.kayttokohdeOrganisationOid),
                            this.createKayttooikeusKestoField(this.kestoAlkaaAction, this.kayttooikeusModel.alkupvm,
                                this.kestoPaattyyAction, this.kayttooikeusModel.loppupvm),
                            this.createKayttooikeusKayttooikeudetField(
                                this.props.kayttooikeus.allowedKayttooikeus[this.props.oidHenkilo],
                                this.state.selectedList, this.kayttooikeudetAction, this.close),
                            this.createKayttooikeusHaeButton(() => this.createKayttooikeusAction(),
                                this.state.validationMessages))
                    }
                    </div>
                </div>
            </div>
        );
    };
}

export default HenkiloViewCreateKayttooikeus;
