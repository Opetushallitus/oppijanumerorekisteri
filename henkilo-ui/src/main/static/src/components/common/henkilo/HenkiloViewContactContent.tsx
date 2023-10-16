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
import type { Localisations } from '../../../types/localisation.type';
import type { Locale } from '../../../types/locale.type';
import type { HenkiloState } from '../../../reducers/henkilo.reducer';
import type { Henkilo } from '../../../types/domain/oppijanumerorekisteri/henkilo.types';
import type { Kayttaja } from '../../../types/domain/kayttooikeus/kayttaja.types';
import type { GlobalNotificationConfig } from '../../../types/notification.types';
import type { KoodistoState, KoodistoStateKoodi } from '../../../reducers/koodisto.reducer';
import { hasAnyPalveluRooli } from '../../../utilities/palvelurooli.util';
import type { OmattiedotState } from '../../../reducers/omattiedot.reducer';
import { validateEmail } from '../../../validation/EmailValidator';
import type { Option } from 'react-select';
import { WORK_ADDRESS, EMAIL } from '../../../types/constants';
import { RootState } from '../../../store';
import { View } from '../../henkilo/HenkiloViewPage';
import { Yhteystieto } from '../../../types/domain/oppijanumerorekisteri/yhteystieto.types';
import { YhteystietoRyhma } from '../../../types/domain/oppijanumerorekisteri/yhteystietoryhma.types';

type OwnProps = {
    readOnly: boolean;
    view: View;
};

type StateProps = {
    L: Localisations;
    locale: Locale;
    omattiedot: OmattiedotState;
    henkilo: HenkiloState;
    koodisto: KoodistoState;
};

type DispatchProps = {
    updateHenkiloAndRefetch: (arg0: Henkilo, arg1?: GlobalNotificationConfig) => void;
};

export type Props = OwnProps & StateProps & DispatchProps;

export type ContactInfo = {
    id?: number;
    type: string;
    henkiloUiId?: string;
    name: string;
    readOnly: boolean;
    alkupera: string;
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

const isEmail = ({ label }) => label === EMAIL;

const containsEmail = (infoGroup: ContactInfo): boolean =>
    !!infoGroup.value.filter((info) => isEmail(info)).filter((info) => info.value).length;

const isWorkEmail = (infoGroup: ContactInfo): boolean =>
    infoGroup.id && infoGroup.type === WORK_ADDRESS && containsEmail(infoGroup);

const excludeRemovedItems =
    (removeList: Array<number | string>) =>
    (infoGroup: ContactInfo): boolean =>
        !removeList.includes(infoGroup.id) && !removeList.includes(infoGroup.henkiloUiId);

const resolveWorkAddresses = (contactInfo: Array<ContactInfo>, removeList: Array<number | string>) =>
    (contactInfo || []).filter((infoGroup) => isWorkEmail(infoGroup)).filter(excludeRemovedItems(removeList));

export const resolveDefaultWorkAddress = (contactInfo: Array<ContactInfo>, removeList: Array<number | string>) =>
    resolveWorkAddresses(contactInfo, removeList).reduce(
        (acc, infoGroup) => (infoGroup.id > acc ? infoGroup.id : acc),
        0
    );

export const isLastWorkEmail = (
    infoGroup: ContactInfo,
    contactInfo: Array<ContactInfo>,
    removeList: Array<number | string>
): boolean => isWorkEmail(infoGroup) && resolveWorkAddresses(contactInfo, removeList).length === 1;

const isUnprivileged = (omattiedot: OmattiedotState): boolean => !omattiedot.isAdmin;

const isVirkailija = (kayttaja: Kayttaja): boolean => kayttaja.kayttajaTyyppi === 'VIRKAILIJA';

const isFromVTJ = (group: ContactInfo): boolean => group.alkupera === PropertySingleton.state.YHTEYSTIETO_ALKUPERA_VTJ;

export class HenkiloViewContactContentComponent extends React.Component<Props, State> {
    henkiloUpdate: Henkilo;
    contactInfoTemplate: Array<{
        label: string;
        value?: string;
        inputValue?: string;
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
                this.props.locale
            ),
            yhteystietoRemoveList: [],
            isContactInfoValid: true,
            modified: false,
            contactInfoErrorFields: [],
        };
    }

    isHidden = (group: ContactInfo): boolean =>
        isUnprivileged(this.props.omattiedot) && isVirkailija(this.props.henkilo.kayttaja) && isFromVTJ(group);

    isVisible = (group: ContactInfo): boolean => !this.isHidden(group);

    createContent() {
        const defaultWorkAddress = resolveDefaultWorkAddress(this.state.contactInfo, this.state.yhteystietoRemoveList);
        const content: Array<React.ReactNode> = this.state.contactInfo
            .filter(this.isVisible)
            .filter(excludeRemovedItems(this.state.yhteystietoRemoveList))
            .map((yhteystiedotRyhmaFlat, idx) => (
                <div key={idx}>
                    <span className="oph-h3 oph-bold midHeader">
                        {yhteystiedotRyhmaFlat.name} {yhteystiedotRyhmaFlat.id === defaultWorkAddress ? '*' : ''}
                    </span>
                    {!this.state.readOnly &&
                    !yhteystiedotRyhmaFlat.readOnly &&
                    !isLastWorkEmail(
                        yhteystiedotRyhmaFlat,
                        this.state.contactInfo,
                        this.state.yhteystietoRemoveList
                    ) ? (
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
                                        isEmail={isEmail(yhteystietoFlat)}
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
                    onClick={() => this._createYhteystiedotRyhma(WORK_ADDRESS)}
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
            this.props.view === 'omattiedot'
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

    _updateModelField(
        contactInfo: {
            label: string;
            value: string;
            inputValue: string;
        },
        event: Option<string> & React.SyntheticEvent<HTMLInputElement>
    ) {
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
            ryhmaAlkuperaTieto: PropertySingleton.state.YHTEYSTIETO_ALKUPERA_VIRKAILIJA_UI,
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
            value?: string;
            inputValue?: string;
        }>,
        yhteystietotyypit: KoodistoStateKoodi[],
        locale: string
    ) =>
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
            value?: string;
            inputValue?: string;
        }>,
        yhteystietoList: Array<Yhteystieto>,
        idx: number,
        yhteystiedotRyhma: YhteystietoRyhma,
        yhteystietotyypit: KoodistoStateKoodi[],
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
            alkupera: yhteystiedotRyhma.ryhmaAlkuperaTieto,
        };
    }

    validateContactInfo(contactInfoLabel: string, contactInfoValue: string) {
        if (contactInfoLabel === EMAIL) {
            return validateEmail(contactInfoValue);
        }
        return true;
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
    omattiedot: state.omattiedot,
    henkilo: state.henkilo,
    koodisto: state.koodisto,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    updateHenkiloAndRefetch,
})(HenkiloViewContactContentComponent);
