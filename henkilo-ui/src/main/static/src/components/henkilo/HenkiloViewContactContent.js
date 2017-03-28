import './HenkiloViewContactContent.css'
import React from 'react'
import Columns from 'react-columns'
import Field from '../common/field/Field';
import Button from "../common/button/Button";
import Select2 from '../common/select/Select2';

const HenkiloViewContactContent = React.createClass({
    propTypes: {
        l10n: React.PropTypes.object.isRequired,
        henkilo: React.PropTypes.object.isRequired,
        readOnly: React.PropTypes.bool.isRequired,
        locale: React.PropTypes.string.isRequired,
        koodisto: React.PropTypes.shape({yhteystietotyypit: React.PropTypes.array}).isRequired,
        updateHenkilo: React.PropTypes.func.isRequired,
    },
    getInitialState: function() {
        this.henkiloUpdate = this.props.henkilo.henkilo;
        this.contactInfoTemplate = [
            {label: 'YHTEYSTIETO_SAHKOPOSTI', value: null, inputValue: null},
            {label: 'YHTEYSTIETO_PUHELINNUMERO', value: null, inputValue: null},
            {label: 'YHTEYSTIETO_MATKAPUHELINNUMERO', value: null, inputValue: null},
            {label: 'YHTEYSTIETO_KATUOSOITE', value: null, inputValue: null},
            {label: 'YHTEYSTIETO_POSTINUMERO', value: null, inputValue: null},
            {label: 'YHTEYSTIETO_KUNTA', value: null, inputValue: null},
        ];
        this.yhteystietotyypitKoodis = this.props.koodisto.yhteystietotyypit;


        return {
            readOnly: this.props.readOnly,
            showPassive: false,
            contactInfo: this._updateYhteystiedot(this),
        }
    },
    render: function() {
        const L = this.props.l10n[this.props.locale];
        return (
            <div className="henkiloViewUserContentWrapper">
                <Columns columns={1}>
                    <div>
                        <div className="header">
                            <h2>{L['HENKILO_YHTEYSTIEDOT_OTSIKKO']}</h2>
                            { !this.state.readOnly
                                ? <div>
                                    <Select2 data={this.yhteystietotyypitKoodis.map((yhteystietotyyppi, idx) =>
                                        ({id: yhteystietotyyppi.value, text:yhteystietotyyppi[this.props.locale]}))}
                                             onSelect={this._createYhteystiedotRyhma}
                                             options={{placeholder:L['HENKILO_LUOYHTEYSTIETO']}} />
                                </div>
                                : null
                            }
                        </div>
                        <div className="henkiloViewContent">
                            {this.state.contactInfo.map((yhteystiedotRyhma, idx) =>
                            <div key={idx}>
                                <Columns columns={this.state.contactInfo.length}>
                                    <h3>{yhteystiedotRyhma.name}</h3>
                                    { yhteystiedotRyhma.value.map((yhteystieto, idx2) =>
                                        <div key={idx2} id={yhteystieto.label}>
                                            { !this.state.readOnly || yhteystieto.value
                                                ? <Columns columns={2}>
                                                    <span className="strong">{L[yhteystieto.label]}</span>
                                                    <Field inputValue={yhteystieto.inputValue} changeAction={this._updateModelField}
                                                           readOnly={this.state.readOnly}>{yhteystieto.value}</Field>
                                                </Columns>
                                                : null}

                                        </div>
                                    ) }
                                </Columns>
                            </div>
                            )}
                        </div>
                    </div>
                </Columns>
                {this.state.readOnly
                    ? <div className="henkiloViewButtons">
                        <Button big action={this._edit}>{L['MUOKKAA_LINKKI']}</Button>
                    </div>
                    : <div className="henkiloViewEditButtons">
                        <Button big action={this._discard}>{L['PERUUTA_LINKKI']}</Button>
                        <Button confirm big action={this._update}>{L['TALLENNA_LINKKI']}</Button>
                    </div>
                }
            </div>
        )
    },
    _edit: function () {
        this.setState({readOnly: false});
        this._preEditData = {
            contactInfo: this.state.contactInfo,
            henkiloUpdate: JSON.parse(JSON.stringify(this.henkiloUpdate)), // deep copy
        }
    },
    _discard: function () {
        this.henkiloUpdate = this._preEditData.henkiloUpdate;
        this.setState({
            readOnly: true,
            contactInfo: this._preEditData.contactInfo,
        });
    },
    _update: function () {
        this.props.updateHenkilo(this.henkiloUpdate);
    },
    _updateModelField: function (event) {
        const value = event.target.value;
        const fieldpath = event.target.name;
        this._updateFieldByDotAnnotation(this.henkiloUpdate, fieldpath, value);
    },
    _updateFieldByDotAnnotation: function(obj, path, value) {
        let schema = obj;  // a moving reference to internal objects within obj
        const pList = path.split('.');
        const len = pList.length;
        for(let i = 0; i < len-1; i++) {
            let elem = pList[i];
            if( !schema[elem] ) {
                schema[elem] = {};
            }
            schema = schema[elem];
        }

        schema[pList[len-1]] = value;
    },
    _createYhteystiedotRyhma: function (event) {
        this.henkiloUpdate.yhteystiedotRyhma.push({
            readOnly: false,
            ryhmaAlkuperaTieto: "alkupera2", // Virkailija
            ryhmaKuvaus: event.target.value,
            yhteystieto: []
        });
        const contactInfo = this._updateYhteystiedot(this);
        this.setState({
            contactInfo: contactInfo
        });
    },

    _updateYhteystiedot: _this =>
        _this.henkiloUpdate.yhteystiedotRyhma.map((yhteystiedotRyhma, idx) => {
            const yhteystietoList = yhteystiedotRyhma.yhteystieto;
            const YhteystietoFlatList = {
                value: _this.contactInfoTemplate.map(((template, idx2) => (
                    {label: template.label, value: yhteystietoList.filter(yhteystieto => yhteystieto.yhteystietoTyyppi === template.label)[0]
                    && yhteystietoList.filter(yhteystieto => yhteystieto.yhteystietoTyyppi === template.label)[0].yhteystietoArvo,
                        inputValue: 'yhteystiedotRyhma.' + idx + '.yhteystieto.' + idx2 + '.yhteystietoArvo'}
                ))),
                name: yhteystiedotRyhma.ryhmaKuvaus && _this.yhteystietotyypitKoodis.filter(kieli =>
                kieli.value === yhteystiedotRyhma.ryhmaKuvaus)[0][_this.props.locale]
            };
            yhteystiedotRyhma.yhteystieto = YhteystietoFlatList.value.map(yhteystietoFlat => (
                {
                    yhteystietoTyyppi: yhteystietoFlat.label,
                    yhteystietoArvo: yhteystietoFlat.value,
                }
            ));
            return YhteystietoFlatList;
        }),
});

export default HenkiloViewContactContent
