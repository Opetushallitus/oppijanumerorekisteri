import './HenkiloViewContactContent.css'
import React from 'react'
import Columns from 'react-columns'
import Field from '../field/Field';
import Button from "../button/Button";
import OphSelect from '../select/OphSelect'
import StaticUtils from "../StaticUtils";
import EditButtons from "./buttons/EditButtons";
import AbstractViewContainer from "../../../containers/henkilo/AbstractViewContainer";

class HenkiloViewContactContent extends React.Component{
    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        henkilo: React.PropTypes.shape({henkilo: React.PropTypes.object.isRequired,}).isRequired,
        readOnly: React.PropTypes.bool.isRequired,
        locale: React.PropTypes.string.isRequired,
        koodisto: React.PropTypes.shape({yhteystietotyypit: React.PropTypes.array}).isRequired,
        updateHenkiloAndRefetch: React.PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

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
            contactInfo: this._updateYhteystiedot(this.henkiloUpdate, this.contactInfoTemplate, this.props.koodisto.yhteystietotyypit, this.props.locale),
        };
    };

    render() {
        const L = this.props.l10n[this.props.locale];
        return (
            <div className="henkiloViewUserContentWrapper">
                <div>
                    <div className="right" style={{width: "20%"}}>
                        { !this.state.readOnly
                            ? <div>
                                <OphSelect onChange={this._createYhteystiedotRyhma.bind(this)}
                                           options={AbstractViewContainer.creatableYhteystietotyypit(this.props.koodisto.yhteystietotyypit)
                                               .map((yhteystietotyyppi, idx) =>
                                                   ({value: yhteystietotyyppi.value, label:yhteystietotyyppi[this.props.locale]}))}
                                           placeholder={L['HENKILO_LUOYHTEYSTIETO']} />
                            </div>
                            : null
                        }
                    </div>
                    <div className="header">
                        <p className="oph-h2 oph-bold">{L['HENKILO_YHTEYSTIEDOT_OTSIKKO']}</p>
                    </div>
                    <div className="henkiloViewContent">
                        <Columns queries={[{columns: 3, query: 'min-width: 200px'}]} gap="10px" >
                            {this.state.contactInfo.map((yhteystiedotRyhmaFlat, idx) =>
                                    <div key={idx}>
                                        <p className="oph-h3 oph-bold midHeader">{yhteystiedotRyhmaFlat.name}</p>
                                        { yhteystiedotRyhmaFlat.value.map((yhteystietoFlat, idx2) =>
                                            <div key={idx2} id={yhteystietoFlat.label}>
                                                { (!this.state.readOnly && !yhteystiedotRyhmaFlat.readOnly) || yhteystietoFlat.value
                                                    ? <Columns columns={2} className="labelValue" rootStyles={{marginRight: '25%'}}>
                                                        <span className="oph-bold">{L[yhteystietoFlat.label]}</span>
                                                        <Field inputValue={yhteystietoFlat.inputValue}
                                                               changeAction={this._updateModelField.bind(this)}
                                                               readOnly={yhteystiedotRyhmaFlat.readOnly || this.state.readOnly}>
                                                            {yhteystietoFlat.value}
                                                        </Field>
                                                    </Columns>
                                                    : null}
                                            </div>
                                        ) }
                                    </div>
                            )}
                        </Columns>
                    </div>
                </div>
                {this.state.readOnly
                    ? <div className="henkiloViewButtons">
                        <Button key="contactEdit" big action={this._edit.bind(this)}>{L['MUOKKAA_LINKKI']}</Button>
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
        this._preEditData = {
            contactInfo: this.state.contactInfo,
        }
    };

    _discard() {
        this.henkiloUpdate = JSON.parse(JSON.stringify(this.props.henkilo.henkilo)); // deep copy
        this.setState({
            readOnly: true,
            contactInfo: this._preEditData.contactInfo,
        });
    };

    _update() {
        this.props.updateHenkiloAndRefetch(this.henkiloUpdate);
    };

    _updateModelField(event) {
        const value = event.target.value;
        const fieldpath = event.target.name;
        StaticUtils.updateFieldByDotAnnotation(this.henkiloUpdate, fieldpath, value);
    };

    _createYhteystiedotRyhma(event) {
        this.henkiloUpdate.yhteystiedotRyhma.push({
            readOnly: false,
            ryhmaAlkuperaTieto: "alkupera2", // Virkailija
            ryhmaKuvaus: event.value,
            yhteystieto: []
        });
        const contactInfo = this._updateYhteystiedot(this.henkiloUpdate, this.contactInfoTemplate,
            this.props.koodisto.yhteystietotyypit, this.props.locale);
        this.setState({
            contactInfo: contactInfo
        });
    };

    _updateYhteystiedot = (henkiloUpdate, contactInfoTemplate, yhteystietotyypit, locale) =>
        henkiloUpdate.yhteystiedotRyhma.map((yhteystiedotRyhma, idx) => {
            const yhteystietoList = yhteystiedotRyhma.yhteystieto;
            const YhteystietoFlatList = {
                value: contactInfoTemplate.map(((template, idx2) => (
                    {label: template.label, value: yhteystietoList.filter(yhteystieto => yhteystieto.yhteystietoTyyppi === template.label)[0]
                    && yhteystietoList.filter(yhteystieto => yhteystieto.yhteystietoTyyppi === template.label)[0].yhteystietoArvo,
                        inputValue: 'yhteystiedotRyhma.' + idx + '.yhteystieto.' + idx2 + '.yhteystietoArvo'}
                ))),
                name: yhteystiedotRyhma.ryhmaKuvaus && yhteystietotyypit.filter(kieli =>
                kieli.value === yhteystiedotRyhma.ryhmaKuvaus)[0][locale],
                readOnly: yhteystiedotRyhma.readOnly,
            };
            yhteystiedotRyhma.yhteystieto = YhteystietoFlatList.value.map(yhteystietoFlat => (
                {
                    yhteystietoTyyppi: yhteystietoFlat.label,
                    yhteystietoArvo: yhteystietoFlat.value,
                }
            ));
            return YhteystietoFlatList;
        });
}

export default HenkiloViewContactContent
