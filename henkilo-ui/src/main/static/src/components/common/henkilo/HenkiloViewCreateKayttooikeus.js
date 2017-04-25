import './HenkiloViewCreateKayttooikeus.css'
import React from 'react'
import AbstractViewContainer from "../../../containers/henkilo/AbstractViewContainer";

class HenkiloViewCreateKayttooikeus extends AbstractViewContainer {
    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,
    };
    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
        this.KO_TEMP_INITIALDATA = [{id: 'id', text: 'text'}, {id: 'id2', text: 'text2'}];
        this.validationMessages = [{id: 'organisation', label: 'HENKILO_LISAA_KAYTTOOIKEUDET_ORGANISAATIO_VALID'},
            {id: 'kayttooikeus', label: 'HENKILO_LISAA_KAYTTOOIKEUDET_KAYTTOOIKEUS_VALID'}];
        this.kayttooikeusList = [];

        this.checkAndSetIfInvalid = (id, label) => {
            if(this.validationMessages.filter(validationMessage => validationMessage.id === id)[0] === undefined
                && event.target.value === '') {
                this.validationMessages.push({id, label});
            }
        };

        this.organisationAction = (event) => {
            // set organisation to state
            // ...
            // Validation
            this.checkAndSetIfInvalid('organisation', 'HENKILO_LISAA_KAYTTOOIKEUDET_ORGANISAATIO_VALID');
        };

        this.ryhmaAction = (event) => {
            // set ryhma to state
            // ...
            // Validation
            this.checkAndSetIfInvalid('ryhma', 'HENKILO_LISAA_KAYTTOOIKEUDET_ORGANISAATIO_VALID');
        };

        this.kayttooikeudetAction = (event) => {
            // set ko value
            const value = event.target.value;
            this.setState({
                selectedList: [...this.state.selectedList, value],
            });
            this.checkAndSetIfInvalid('kayttooikeus', 'HENKILO_LISAA_KAYTTOOIKEUDET_KAYTTOOIKEUS_VALID');
        };

        this.close = (kayttooikeusId) => {
            this.setState({
                selectedList: this.state.selectedList.filter(selected => selected !== kayttooikeusId),
            });
        };

        this.state = {
            selectedList: [],
        }
    };

    render() {
        return (
            <div className="henkiloViewUserContentWrapper">
                <div className="add-kayttooikeus-container">
                    <div className="header">
                        <p className="oph-h2 oph-bold">{this.L['HENKILO_LISAA_KAYTTOOIKEUDET_OTSIKKO']}</p>
                    </div>
                    {
                        this.createKayttooikeusFields(
                            this.createKayttooikeusKohdeField([{id: 'x', text: 'd'}],
                                this.organisationAction, [{id: 'x', text: 'd'}], this.ryhmaAction),
                            this.createKayttooikeusKestoField(() => {}, () => {}),
                            this.createKayttooikeusKayttooikeudetField(this.KO_TEMP_INITIALDATA, this.state.selectedList,
                                this.kayttooikeudetAction, this.close),
                            this.createKayttooikeusHaeButton(() => {}, this.validationMessages))
                    }
                    <div>
                    </div>
                </div>
            </div>
        );
    };
}

export default HenkiloViewCreateKayttooikeus;
