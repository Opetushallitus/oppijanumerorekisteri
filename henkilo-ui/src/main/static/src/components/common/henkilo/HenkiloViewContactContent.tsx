import './HenkiloViewContactContent.css';
import * as React from 'react';
import { connect } from 'react-redux';
import Columns from 'react-columns';
import Field from '../field/Field';
import Button from '../button/Button';
import StaticUtils from '../StaticUtils';
import EditButtons from './buttons/EditButtons';
import PropertySingleton from '../../../globals/PropertySingleton';
import AddIcon from '../icons/AddIcon';
import IconButton from '../button/IconButton';
import CrossIcon from '../icons/CrossIcon';
import { updateHenkiloAndRefetch } from '../../../actions/henkilo.actions';
import { Localisations } from '../../../types/localisation.type';
import { Locale } from '../../../types/locale.type';
import { HenkiloState } from '../../../reducers/henkilo.reducer';
import { Henkilo } from '../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { GlobalNotificationConfig } from '../../../types/notification.types';
import { KoodistoState } from '../../../reducers/koodisto.reducer';
import { hasAnyPalveluRooli } from '../../../utilities/palvelurooli.util';
import { OmattiedotState } from '../../../reducers/omattiedot.reducer';
import { validateEmail } from '../../../validation/EmailValidator';
import { ReactSelectOption } from '../../../types/react-select.types';

type OwnProps = {
    henkilo: HenkiloState;
    readOnly: boolean;
    koodisto: KoodistoState;
    view: string;
};

type Props = OwnProps & {
    L: Localisations;
    locale: Locale;
    updateHenkiloAndRefetch: (arg0: Henkilo, arg1?: GlobalNotificationConfig) => void;
    omattiedot: OmattiedotState;
};

type ContactInfo = {
    id: number | null | undefined;
    type: string;
    henkiloUiId: string | null | undefined;
    name: string;
    readOnly: boolean;
    value: Array<{ label: string; value: string; inputValue: string }>;
};

type State = {
    readOnly: boolean;
    showPassive: boolean;
    contactInfo: Array<ContactInfo>;
    yhteystietoRemoveList: Array<number | string>;
    modified: boolean;
    contactInfoErrorFields: Array<string>;
    isContactInfoValid: boolean;
};

const WORK_ADDRESS = 'yhteystietotyyppi2'; // refers to koodisto (yhteystietotyypit)

class HenkiloViewContactContent extends React.Component<Props, State> {
    henkiloUpdate: Henkilo;
    contactInfoTemplate: Array<{
        label: string;
        value: string | null | undefined;
        inputValue: string | null | undefined;
    }>;
    _preEditData: { contactInfo: Array<ContactInfo> };

    constructor(props: Props) {
        super(props);

        this.henkiloUpdate = JSON.parse(JSON.stringify(this.props.henkilo.henkilo)); // deep copy
        this.contactInfoTemplate = [
            { label: 'YHTEYSTIETO_SAHKOPOSTI', value: null, inputValue: null },
            { label: 'YHTEYSTIETO_PUHELINNUMERO', value: null, inputValue: null },
            {
                label: 'YHTEYSTIETO_MATKAPUHELINNUMERO',
                value: null,
                inputValue: null,
            },
            { label: 'YHTEYSTIETO_KATUOSOITE', value: null, inputValue: null },
            { label: 'YHTEYSTIETO_POSTINUMERO', value: null, inputValue: null },
            { label: 'YHTEYSTIETO_KUNTA', value: null, inputValue: null },
        ];

        this.state = {
            readOnly: this.props.readOnly,
            showPassive: false,
            contactInfo: this._initialiseYhteystiedot(
                this.henkiloUpdate,
                this.contactInfoTemplate,
                this.props.koodisto.yhteystietotyypit,
                this.props.locale,
                []
            ),
            yhteystietoRemoveList: [],
            isContactInfoValid: true,
            modified: false,
            contactInfoErrorFields: [],
        };
    }

    createContent() {
        const isEmail = (label: string) => label === PropertySingleton.state.SAHKOPOSTI;

        const defaultWorkAddress = (this.state.contactInfo || [])
            .filter((contactInfo) => contactInfo.type === WORK_ADDRESS)
            .reduce((_, curr, acc) => (curr.id > acc ? curr.id : acc), 0);

        const content: Array<React.ReactNode> = this.state.contactInfo
            .filter(
                (yhteystiedotRyhmaFlat) => this.state.yhteystietoRemoveList.indexOf(yhteystiedotRyhmaFlat.id) === -1
            )
            .filter(
                (yhteystiedotRyhmaFlat) =>
                    this.state.yhteystietoRemoveList.indexOf(yhteystiedotRyhmaFlat.henkiloUiId) === -1
            )
            .map((yhteystiedotRyhmaFlat, idx) => (
                <div key={idx}>
                    <span className="oph-h3 oph-bold midHeader">
                        {yhteystiedotRyhmaFlat.name} {yhteystiedotRyhmaFlat.id === defaultWorkAddress ? '*' : ''}
                    </span>
                    {!this.state.readOnly && !yhteystiedotRyhmaFlat.readOnly ? (
                        <span className="float-right">
                            <IconButton
                                onClick={() =>
                                    this._removeYhteystieto(
                                        yhteystiedotRyhmaFlat.id || yhteystiedotRyhmaFlat.henkiloUiId
                                    )
                                }
                            >
                                <CrossIcon />
                            </IconButton>
                        </span>
                    ) : null}
                    {yhteystiedotRyhmaFlat.value.map((yhteystietoFlat, idx2) => (
                        <div key={idx2} id={yhteystietoFlat.label}>
                            {(!this.state.readOnly && !yhteystiedotRyhmaFlat.readOnly) || yhteystietoFlat.value ? (
                                <Columns columns={2} className="labelValue">
                                    <span className="oph-bold">{this.props.L[yhteystietoFlat.label]}</span>
                                    <Field
                                        inputValue={yhteystietoFlat.inputValue}
                                        changeAction={this._updateModelField.bind(this, yhteystietoFlat)}
                                        isEmail={isEmail(yhteystietoFlat.label)}
                                        readOnly={yhteystiedotRyhmaFlat.readOnly || this.state.readOnly}
                                    >
                                        {yhteystietoFlat.value}
                                    </Field>
                                </Columns>
                            ) : null}
                        </div>
                    ))}
                </div>
            ));
        if (!this.state.readOnly) {
            content.push(
                <div
                    className="contact-content-add-new"
                    onClick={() => this._createYhteystiedotRyhma(PropertySingleton.getState().TYOOSOITE)}
                    key="add-new"
                >
                    <span className="oph-bold oph-blue-lighten-1">
                        <AddIcon /> {this.props.L['HENKILO_LUOYHTEYSTIETO']}
                    </span>
                </div>
            );
        }
        return content;
    }

    render() {
        const passivoitu = this.props.henkilo.henkilo.passivoitu;
        const duplicate = this.props.henkilo.henkilo.duplicate;
        const hasHenkiloReadUpdateRights: boolean =
            this.props.view === 'OMATTIEDOT'
                ? true
                : hasAnyPalveluRooli(this.props.omattiedot.organisaatiot, [
                      'OPPIJANUMEROREKISTERI_HENKILON_RU',
                      'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
                  ]);

        const editButton = hasHenkiloReadUpdateRights ? (
            <Button disabled={passivoitu || duplicate} key="contactEdit" action={this._edit.bind(this)}>
                {this.props.L['MUOKKAA_LINKKI']}
            </Button>
        ) : null;
        return (
            <div className="henkiloViewUserContentWrapper contact-content">
                <div>
                    <div className="header">
                        <p className="oph-h2 oph-bold">{this.props.L['HENKILO_YHTEYSTIEDOT_OTSIKKO']}</p>
                    </div>
                    {this.props.henkilo.henkilo.turvakielto ? (
                        <div className="oph-h3 oph-bold midHeader">{this.props.L['YHTEYSTIETO_TURVAKIELTO']}</div>
                    ) : null}

                    <div className="henkiloViewContent">
                        <Columns columns={2} gap="25px">
                            {this.createContent()}
                        </Columns>
                    </div>
                </div>
                {this.state.readOnly ? (
                    <div className="henkiloViewButtons">{editButton}</div>
                ) : (
                    <div className="henkiloViewEditButtons">
                        <EditButtons
                            discardAction={this._discard.bind(this)}
                            updateAction={this._update.bind(this)}
                            L={this.props.L}
                            isValidForm={this.state.modified && this.state.contactInfoErrorFields.length === 0}
                        />
                    </div>
                )}
            </div>
        );
    }

    _removeYhteystieto(id: (number | null | undefined) | (string | null | undefined)) {
        if (id) {
            this.setState({
                yhteystietoRemoveList: [...this.state.yhteystietoRemoveList, id],
                modified: true,
            });
        }
    }

    _edit() {
        this.setState({ readOnly: false });
        this._preEditData = {
            contactInfo: this.state.contactInfo,
        };
    }

    _discard() {
        this.henkiloUpdate = JSON.parse(JSON.stringify(this.props.henkilo.henkilo)); // deep copy
        this.setState({
            readOnly: true,
            contactInfo: this._preEditData.contactInfo,
            yhteystietoRemoveList: [],
            modified: false,
        });
    }

    _update() {
        this.state.yhteystietoRemoveList.forEach((yhteystietoId) =>
            this.henkiloUpdate.yhteystiedotRyhma.splice(
                this.henkiloUpdate.yhteystiedotRyhma.findIndex(
                    (yhteystieto) => yhteystieto.id === yhteystietoId || yhteystieto.henkiloUiId === yhteystietoId
                ),
                1
            )
        );
        this.setState({ yhteystietoRemoveList: [] });
        this.props.updateHenkiloAndRefetch(this.henkiloUpdate);
    }

    _updateModelField(contactInfo: any, event: ReactSelectOption & React.SyntheticEvent<HTMLInputElement>) {
        const isContactInfoValid = this.validateContactInfo(contactInfo.label, event.currentTarget.value);
        StaticUtils.updateFieldByDotAnnotation(this.henkiloUpdate, event);
        let contactInfoErrorFields = this.state.contactInfoErrorFields;
        if (isContactInfoValid) {
            contactInfoErrorFields = contactInfoErrorFields.filter(
                (errorKeyValue) => errorKeyValue !== contactInfo.inputValue
            );
        } else {
            contactInfoErrorFields.push(contactInfo.inputValue);
        }

        this.setState({ modified: true, contactInfoErrorFields });
    }

    _createYhteystiedotRyhma(yhteystietoryhmaTyyppi: string) {
        const henkiloUiId = 'henkilo_ui_id_' + PropertySingleton.getNewId();
        const newYhteystiedotRyhma = {
            readOnly: false,
            ryhmaAlkuperaTieto: 'alkupera2', // Virkailija
            ryhmaKuvaus: yhteystietoryhmaTyyppi,
            yhteystieto: this.contactInfoTemplate.map((template) => ({
                yhteystietoTyyppi: template.label,
            })),
            henkiloUiId: henkiloUiId,
            id: null,
        };
        this.henkiloUpdate.yhteystiedotRyhma.push(newYhteystiedotRyhma);
        const contactInfo = [
            ...this.state.contactInfo,
            this.createFlatYhteystieto(
                this.contactInfoTemplate,
                [],
                this.henkiloUpdate.yhteystiedotRyhma.length - 1,
                newYhteystiedotRyhma,
                this.props.koodisto.yhteystietotyypit,
                this.props.locale,
                henkiloUiId
            ),
        ];
        this.setState({
            contactInfo: contactInfo,
            modified: true,
        });
    }

    _initialiseYhteystiedot = (
        henkiloUpdate: Henkilo,
        contactInfoTemplate: Array<{
            label: string;
            value: string | null | undefined;
            inputValue: string | null | undefined;
        }>,
        yhteystietotyypit: Array<any>,
        locale: string,
        yhteystietoRemoveList: Array<any>
    ): Array<any> =>
        henkiloUpdate.yhteystiedotRyhma.map((yhteystiedotRyhma, idx) => {
            const yhteystietoFlatList = this.createFlatYhteystieto(
                contactInfoTemplate,
                yhteystiedotRyhma.yhteystieto,
                idx,
                yhteystiedotRyhma,
                yhteystietotyypit,
                locale
            );
            yhteystiedotRyhma.yhteystieto = yhteystietoFlatList.value.map((yhteystietoFlat) => ({
                yhteystietoTyyppi: yhteystietoFlat.label,
                yhteystietoArvo: yhteystietoFlat.value,
            }));
            return yhteystietoFlatList;
        });

    createFlatYhteystieto(
        contactInfoTemplate: Array<{
            label: string;
            value: string | null | undefined;
            inputValue: string | null | undefined;
        }>,
        yhteystietoList: Array<any>,
        idx: number,
        yhteystiedotRyhma: any,
        yhteystietotyypit: Array<any>,
        locale: string,
        henkiloUiId?: string
    ): ContactInfo {
        return {
            value: contactInfoTemplate.map((template, idx2) => ({
                label: template.label,
                value:
                    yhteystietoList.filter((yhteystieto) => yhteystieto.yhteystietoTyyppi === template.label)[0] &&
                    yhteystietoList.filter((yhteystieto) => yhteystieto.yhteystietoTyyppi === template.label)[0]
                        .yhteystietoArvo,
                inputValue: 'yhteystiedotRyhma.' + idx + '.yhteystieto.' + idx2 + '.yhteystietoArvo',
            })),
            name:
                yhteystiedotRyhma.ryhmaKuvaus &&
                yhteystietotyypit.filter((kieli) => kieli.value === yhteystiedotRyhma.ryhmaKuvaus)[0][locale],
            readOnly: yhteystiedotRyhma.readOnly,
            id: yhteystiedotRyhma.id,
            henkiloUiId: henkiloUiId,
            type: yhteystiedotRyhma.ryhmaKuvaus,
        };
    }

    validateContactInfo(contactInfoLabel: string, contactInfoValue: string) {
        if (contactInfoLabel === PropertySingleton.state.SAHKOPOSTI) {
            return validateEmail(contactInfoValue);
        }
        return true;
    }
}

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
    omattiedot: state.omattiedot,
});

export default connect<Props, OwnProps>(mapStateToProps, {
    updateHenkiloAndRefetch,
})(HenkiloViewContactContent);
