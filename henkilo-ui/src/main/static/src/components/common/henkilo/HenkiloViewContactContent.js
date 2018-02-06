// @flow
import './HenkiloViewContactContent.css';
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Columns from 'react-columns';
import Field from '../field/Field';
import Button from '../button/Button';
import StaticUtils from "../StaticUtils";
import EditButtons from "./buttons/EditButtons";
import PropertySingleton from '../../../globals/PropertySingleton';
import AddIcon from '../icons/AddIcon';
import IconButton from '../button/IconButton';
import CrossIcon from '../icons/CrossIcon';
import {updateHenkiloAndRefetch} from '../../../actions/henkilo.actions';
import type {L} from "../../../types/localisation.type";
import type {Locale} from "../../../types/locale.type";
import type {HenkiloState} from "../../../reducers/henkilo.reducer";
import type {Henkilo} from "../../../types/domain/oppijanumerorekisteri/henkilo.types";
import type {GlobalNotificationConfig} from "../../../types/notification.types";
import type {KoodistoState} from "../../../reducers/koodisto.reducer";

type Props = {
    L: L,
    locale: Locale,
    henkilo: HenkiloState,
    readOnly: boolean,
    koodisto: KoodistoState,
    updateHenkiloAndRefetch: (Henkilo, ?GlobalNotificationConfig) => void,
}

type ContactInfo = {
    id: ?number,
    henkiloUiId: ?string,
    name: string,
    readOnly: boolean,
    value: Array<{label: string, value: string, inputValue: string,}>,
}

type State = {
    readOnly: boolean,
    showPassive: boolean,
    contactInfo: Array<ContactInfo>,
    yhteystietoRemoveList: Array<number | string>,
    modified: boolean,
}

class HenkiloViewContactContent extends React.Component<Props, State> {
    static propTypes = {
        henkilo: PropTypes.shape({henkilo: PropTypes.object.isRequired,}).isRequired,
        readOnly: PropTypes.bool.isRequired,
        locale: PropTypes.string.isRequired,
        koodisto: PropTypes.shape({yhteystietotyypit: PropTypes.array}).isRequired,
        updateHenkiloAndRefetch: PropTypes.func.isRequired,
    };

    henkiloUpdate: Henkilo;
    contactInfoTemplate: Array<{label: string, value: ?string, inputValue: ?string}>;
    _preEditData: {contactInfo: Array<ContactInfo>};

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
            contactInfo: this._initialiseYhteystiedot(this.henkiloUpdate, this.contactInfoTemplate, this.props.koodisto.yhteystietotyypit, this.props.locale, []),
            yhteystietoRemoveList: [],
            modified: false
        };
    };

    createContent() {
        const content = this.state.contactInfo
            .filter(yhteystiedotRyhmaFlat => this.state.yhteystietoRemoveList.indexOf(yhteystiedotRyhmaFlat.id) === -1)
            .filter(yhteystiedotRyhmaFlat => this.state.yhteystietoRemoveList.indexOf(yhteystiedotRyhmaFlat.henkiloUiId) === -1)
            .map((yhteystiedotRyhmaFlat, idx) =>
                <div key={idx}>
                    <span className="oph-h3 oph-bold midHeader">{yhteystiedotRyhmaFlat.name}</span>
                    {
                        !this.state.readOnly && !yhteystiedotRyhmaFlat.readOnly ?
                            <span className="float-right">
                                <IconButton onClick={() => this._removeYhteystieto(yhteystiedotRyhmaFlat.id || yhteystiedotRyhmaFlat.henkiloUiId)} >
                                    <CrossIcon />
                                </IconButton>
                            </span>
                            : null
                    }
                    { yhteystiedotRyhmaFlat.value.map((yhteystietoFlat, idx2) =>
                        <div key={idx2} id={yhteystietoFlat.label}>
                            { (!this.state.readOnly && !yhteystiedotRyhmaFlat.readOnly) || yhteystietoFlat.value
                                ? <Columns columns={2} className="labelValue">
                                    <span className="oph-bold">{this.props.L[yhteystietoFlat.label]}</span>
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
                    <span className="oph-bold oph-blue-lighten-1"><AddIcon /> {this.props.L['HENKILO_LUOYHTEYSTIETO']}</span>
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
                        <p className="oph-h2 oph-bold">{this.props.L['HENKILO_YHTEYSTIEDOT_OTSIKKO']}</p>
                    </div>
                    <div className="henkiloViewContent">
                        <Columns columns={2} gap="25px" >
                            {this.createContent()}
                        </Columns>
                    </div>
                </div>
                {this.state.readOnly
                    ? <div className="henkiloViewButtons">
                        <Button disabled={passivoitu || duplicate} key="contactEdit" action={this._edit.bind(this)}>{this.props.L['MUOKKAA_LINKKI']}</Button>
                    </div>
                    : <div className="henkiloViewEditButtons">
                        <EditButtons discardAction={this._discard.bind(this)}
                                     updateAction={this._update.bind(this)}
                                     L={this.props.L}
                                     isValidForm={this.state.modified} />
                    </div>
                }
            </div>
        )
    };

    _removeYhteystieto(id: ?number | ?string) {
        if (id) {
            this.setState({
                yhteystietoRemoveList: [...this.state.yhteystietoRemoveList, id],
                modified: true,
            });
        }
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
            modified: false,
        });
    };

    _update() {
        this.state.yhteystietoRemoveList.forEach(yhteystietoId => this.henkiloUpdate.yhteystiedotRyhma
            .splice(this.henkiloUpdate.yhteystiedotRyhma
                .findIndex(yhteystieto => yhteystieto.id === yhteystietoId || yhteystieto.henkiloUiId === yhteystietoId), 1));
        this.setState({yhteystietoRemoveList: []});
        this.props.updateHenkiloAndRefetch(this.henkiloUpdate);
    };

    _updateModelField(event) {
        StaticUtils.updateFieldByDotAnnotation(this.henkiloUpdate, event);
        this.setState({modified: true,});
    };

    _createYhteystiedotRyhma(yhteystietoryhmaTyyppi) {
        const henkiloUiId = 'henkilo_ui_id_' + PropertySingleton.getNewId();
        const newYhteystiedotRyhma = {
            readOnly: false,
            ryhmaAlkuperaTieto: "alkupera2", // Virkailija
            ryhmaKuvaus: yhteystietoryhmaTyyppi,
            yhteystieto: this.contactInfoTemplate.map(template => ({yhteystietoTyyppi: template.label})),
            henkiloUiId: henkiloUiId,
            id: null,
        };
        this.henkiloUpdate.yhteystiedotRyhma.push(newYhteystiedotRyhma);
        const contactInfo = [...this.state.contactInfo,
            this.createFlatYhteystieto(this.contactInfoTemplate, [], this.henkiloUpdate.yhteystiedotRyhma.length-1,
                newYhteystiedotRyhma, this.props.koodisto.yhteystietotyypit, this.props.locale, henkiloUiId)
        ];
        this.setState({
            contactInfo: contactInfo,
            modified: true,
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

    createFlatYhteystieto(contactInfoTemplate, yhteystietoList, idx, yhteystiedotRyhma, yhteystietotyypit, locale, henkiloUiId): ContactInfo {
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

const mapStateToProps = state => ({
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
});

export default connect(mapStateToProps, {updateHenkiloAndRefetch})(HenkiloViewContactContent);
