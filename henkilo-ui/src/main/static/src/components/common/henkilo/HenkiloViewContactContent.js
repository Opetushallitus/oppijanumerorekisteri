import './HenkiloViewContactContent.css'
import React from 'react'
import PropTypes from 'prop-types'
import Columns from 'react-columns'
import Field from '../field/Field';
import Button from "../button/Button";
import StaticUtils from "../StaticUtils";
import EditButtons from "./buttons/EditButtons";
import PropertySingleton from '../../../globals/PropertySingleton'
import AddIcon from "../icons/AddIcon";
import IconButton from "../button/IconButton";
import CrossIcon from "../icons/CrossIcon";

class HenkiloViewContactContent extends React.Component{
    static propTypes = {
        l10n: PropTypes.object.isRequired,
        henkilo: PropTypes.shape({henkilo: PropTypes.object.isRequired,}).isRequired,
        readOnly: PropTypes.bool.isRequired,
        locale: PropTypes.string.isRequired,
        koodisto: PropTypes.shape({yhteystietotyypit: PropTypes.array}).isRequired,
        updateHenkiloAndRefetch: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];

        this.henkiloUpdate = JSON.parse(JSON.stringify(this.props.henkilo.henkilo)); // deep copy
        this.contactInfoTemplate = [
            {label: 'YHTEYSTIETO_SAHKOPOSTI', value: null, inputValue: null},
            {label: 'YHTEYSTIETO_PUHELINNUMERO', value: null, inputValue: null},
            {label: 'YHTEYSTIETO_MATKAPUHELINNUMERO', value: null, inputValue: null},
            {label: 'YHTEYSTIETO_KATUOSOITE', value: null, inputValue: null},
            {label: 'YHTEYSTIETO_POSTINUMERO', value: null, inputValue: null},
            {label: 'YHTEYSTIETO_KUNTA', value: null, inputValue: null},
        ];

        this.state = {
            readOnly: this.props.readOnly,
            showPassive: false,
            contactInfo: this._initialiseYhteystiedot(this.henkiloUpdate, this.contactInfoTemplate, this.props.koodisto.yhteystietotyypit, this.props.locale, []),
            yhteystietoRemoveList: [],
        };
    };

    createContent() {
        const content = this.state.contactInfo
            .filter(yhteystiedotRyhmaFlat => this.state.yhteystietoRemoveList.indexOf(yhteystiedotRyhmaFlat.id) === -1)
            .filter(yhteystiedotRyhmaFlat => this.state.yhteystietoRemoveList.indexOf(yhteystiedotRyhmaFlat.henkiloUiId) === -1)
            .map((yhteystiedotRyhmaFlat, idx) =>
                <div key={idx}>
                    <span className="oph-h3 oph-bold midHeader">{yhteystiedotRyhmaFlat.name} {
                        !this.state.readOnly && !yhteystiedotRyhmaFlat.readOnly
                            ? <IconButton onClick={() =>
                                this._removeYhteystieto(yhteystiedotRyhmaFlat.id || yhteystiedotRyhmaFlat.henkiloUiId)} >
                            <CrossIcon />
                        </IconButton>
                            : null
                    }</span>
                    { yhteystiedotRyhmaFlat.value.map((yhteystietoFlat, idx2) =>
                        <div key={idx2} id={yhteystietoFlat.label}>
                            { (!this.state.readOnly && !yhteystiedotRyhmaFlat.readOnly) || yhteystietoFlat.value
                                ? <Columns columns={2} className="labelValue">
                                    <span className="oph-bold">{this.L[yhteystietoFlat.label]}</span>
                                    <Field inputValue={yhteystietoFlat.inputValue}
                                           changeAction={this._updateModelField.bind(this)}
                                           readOnly={yhteystiedotRyhmaFlat.readOnly || this.state.readOnly}>
                                        {yhteystietoFlat.value}
                                    </Field>
                                </Columns>
                                : null
                            }
                        </div>
                    ) }
                </div>
            );
        if(!this.state.readOnly) {
            content.push(
                <div className="contact-content-add-new"
                     onClick={() => this._createYhteystiedotRyhma(PropertySingleton.getState().TYOOSOITE)}
                     key="add-new">
                    <span className="oph-bold oph-blue-lighten-1"><AddIcon /> {this.L['HENKILO_LUOYHTEYSTIETO']}</span>
                </div>);
        }
        return content;
    };

    render() {

        const passivoitu = this.props.henkilo.henkilo.passivoitu;
        const duplicate = this.props.henkilo.henkilo.duplicate;

        return (
            <div className="henkiloViewUserContentWrapper contact-content">
                <div>
                    <div className="header">
                        <p className="oph-h2 oph-bold">{this.L['HENKILO_YHTEYSTIEDOT_OTSIKKO']}</p>
                    </div>
                    <div className="henkiloViewContent">
                        <Columns columns={3} gap="25px" >
                            {this.createContent()}
                        </Columns>
                    </div>
                </div>
                {this.state.readOnly
                    ? <div className="henkiloViewButtons">
                        <Button disabled={passivoitu | duplicate} key="contactEdit" action={this._edit.bind(this)}>{this.L['MUOKKAA_LINKKI']}</Button>
                    </div>
                    : <div className="henkiloViewEditButtons">
                        <EditButtons discardAction={this._discard.bind(this)} updateAction={this._update.bind(this)} L={this.L} />
                    </div>
                }
            </div>
        )
    };

    _removeYhteystieto(id) {
        this.setState({
            yhteystietoRemoveList: [...this.state.yhteystietoRemoveList, id],
        });
    };

    _edit() {
        this.setState({readOnly: false});
        this._preEditData = {
            contactInfo: this.state.contactInfo,
        };
    };

    _discard() {
        this.henkiloUpdate = JSON.parse(JSON.stringify(this.props.henkilo.henkilo)); // deep copy
        this.setState({
            readOnly: true,
            contactInfo: this._preEditData.contactInfo,
            yhteystietoRemoveList: [],
        });
    };

    _update() {
        this.state.yhteystietoRemoveList.forEach(yhteystietoId => this.henkiloUpdate.yhteystiedotRyhma
            .splice(this.henkiloUpdate.yhteystiedotRyhma.findIndex(yhteystieto => yhteystieto.id === yhteystietoId || yhteystieto.henkiloUiId === yhteystietoId), 1));
        this.setState({yhteystietoRemoveList: []});
        this.props.updateHenkiloAndRefetch(this.henkiloUpdate);
    };

    _updateModelField(event) {
        StaticUtils.updateFieldByDotAnnotation(this.henkiloUpdate, event);
    };

    _createYhteystiedotRyhma(yhteystietoryhmaTyyppi) {
        const henkiloUiId = 'henkilo_ui_id_' + PropertySingleton.getNewId();
        const newYhteystiedotRyhma = {
            readOnly: false,
            ryhmaAlkuperaTieto: "alkupera2", // Virkailija
            ryhmaKuvaus: yhteystietoryhmaTyyppi,
            yhteystieto: this.contactInfoTemplate.map(template => ({yhteystietoTyyppi: template.label})),
            henkiloUiId: henkiloUiId,
        };
        this.henkiloUpdate.yhteystiedotRyhma.push(newYhteystiedotRyhma);
        const contactInfo = [...this.state.contactInfo,
            this.createFlatYhteystieto(this.contactInfoTemplate, [], this.henkiloUpdate.yhteystiedotRyhma.length-1,
                newYhteystiedotRyhma, this.props.koodisto.yhteystietotyypit, this.props.locale, henkiloUiId)
        ];
        this.setState({
            contactInfo: contactInfo
        });
    };

    _initialiseYhteystiedot = (henkiloUpdate, contactInfoTemplate, yhteystietotyypit, locale, yhteystietoRemoveList) =>
        henkiloUpdate.yhteystiedotRyhma
            .map((yhteystiedotRyhma, idx) => {
                const yhteystietoFlatList = this.createFlatYhteystieto(contactInfoTemplate, yhteystiedotRyhma.yhteystieto,
                    idx, yhteystiedotRyhma, yhteystietotyypit, locale);
                yhteystiedotRyhma.yhteystieto = yhteystietoFlatList.value.map(yhteystietoFlat => (
                    {
                        yhteystietoTyyppi: yhteystietoFlat.label,
                        yhteystietoArvo: yhteystietoFlat.value,
                    }
                ));
                return yhteystietoFlatList;
            });

    createFlatYhteystieto(contactInfoTemplate, yhteystietoList, idx, yhteystiedotRyhma, yhteystietotyypit, locale, henkiloUiId) {
        return {
            value: contactInfoTemplate.map(((template, idx2) => (
                {
                    label: template.label,
                    value: yhteystietoList.filter(yhteystieto => yhteystieto.yhteystietoTyyppi === template.label)[0]
                    && yhteystietoList.filter(yhteystieto => yhteystieto.yhteystietoTyyppi === template.label)[0].yhteystietoArvo,
                    inputValue: 'yhteystiedotRyhma.' + idx + '.yhteystieto.' + idx2 + '.yhteystietoArvo',
                }
            ))),
            name: yhteystiedotRyhma.ryhmaKuvaus && yhteystietotyypit.filter(kieli =>
            kieli.value === yhteystiedotRyhma.ryhmaKuvaus)[0][locale],
            readOnly: yhteystiedotRyhma.readOnly,
            id: yhteystiedotRyhma.id,
            henkiloUiId: henkiloUiId,
        };
    }
}

export default HenkiloViewContactContent
