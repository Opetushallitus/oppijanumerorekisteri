import './HenkiloViewCreateKayttooikeus.css'
import React from 'react'
import AbstractViewContainer from "../../../containers/henkilo/AbstractViewContainer";
import StaticUtils from "../StaticUtils";

class HenkiloViewCreateKayttooikeus extends AbstractViewContainer {
    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,
        henkilo: React.PropTypes.shape({henkiloOrgs: React.PropTypes.array.isRequired,}),
    };

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
        this.kayttooikeusModel = {
            kayttokohdeOrganisationOid: '',
            kayttokohdeRyhmaOid: '',
            myonnettavatOikeudet: [],
            alkupvm: new Date(),
            loppupvm: StaticUtils.datePlusOneYear(new Date()),
        };
        this.KO_TEMP_INITIALDATA = [{id: 'id', text: 'text'}, {id: 'id2', text: 'text2'}];

        this.organisationAction = (event) => {
            this.kayttooikeusModel.kayttokohdeOrganisationOid = event.target.value;
            this.setState({
                validationMessages: this.state.validationMessages.filter(
                    validationMessage => validationMessage.id !== 'organisation'),
            });
        };

        this.ryhmaAction = (event) => {
            this.kayttooikeusModel.kayttokohdeRyhmaOid = event.target.value;
            this.setState({
                validationMessages: this.state.validationMessages.filter(
                    validationMessage => validationMessage.id !== 'organisation'),
            });
        };

        this.kayttooikeudetAction = (event) => {
            const value = event.target.value;
            if(value !== '') {
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
            const selectedList = this.state.selectedList.filter(selected => selected !== kayttooikeusId);
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

        this.state = {
            selectedList: [],
            validationMessages: [{id: 'organisation', label: 'HENKILO_LISAA_KAYTTOOIKEUDET_ORGANISAATIO_VALID'},
                {id: 'kayttooikeus', label: 'HENKILO_LISAA_KAYTTOOIKEUDET_KAYTTOOIKEUS_VALID'}]
        }
    };

    render() {
        const organisationSelect = {organisationData: [{id: 'x', text: 'd'}], organisationAction: this.organisationAction,
        organisationValue: this.kayttooikeusModel.kayttokohdeOrganisationOid};
        const ryhmaSelect = {ryhmaData:[ {id: 'x', text: 'd'}], ryhmaAction: this.ryhmaAction,
            ryhmaValue: this.kayttooikeusModel.kayttokohdeRyhmaOid};
        return (
            <div className="henkiloViewUserContentWrapper">
                <div className="add-kayttooikeus-container">
                    <div className="header">
                        <p className="oph-h2 oph-bold">{this.L['HENKILO_LISAA_KAYTTOOIKEUDET_OTSIKKO']}</p>
                    </div>
                    {
                        this.createKayttooikeusFields(
                            this.createKayttooikeusKohdeField(organisationSelect, ryhmaSelect),
                            this.createKayttooikeusKestoField(this.kestoAlkaaAction, this.kayttooikeusModel.alkupvm,
                                this.kestoPaattyyAction, this.kayttooikeusModel.loppupvm),
                            this.createKayttooikeusKayttooikeudetField(this.KO_TEMP_INITIALDATA, this.state.selectedList,
                                this.kayttooikeudetAction, this.close),
                            this.createKayttooikeusHaeButton(() => {}, this.state.validationMessages))
                    }
                    <div>
                    </div>
                </div>
            </div>
        );
    };
}

export default HenkiloViewCreateKayttooikeus;
