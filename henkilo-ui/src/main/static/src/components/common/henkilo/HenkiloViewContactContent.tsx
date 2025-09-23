import './HenkiloViewContactContent.css';
import * as React from 'react';
import { connect } from 'react-redux';
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
import { hasAnyPalveluRooli } from '../../../utilities/palvelurooli.util';
import type { OmattiedotState } from '../../../reducers/omattiedot.reducer';
import { validateEmail } from '../../../validation/EmailValidator';
import { WORK_ADDRESS, EMAIL } from '../../../types/constants';
import { RootState } from '../../../store';
import { View } from '../../henkilo/HenkiloViewPage';
import { Yhteystieto } from '../../../types/domain/oppijanumerorekisteri/yhteystieto.types';
import { YhteystietoRyhma } from '../../../types/domain/oppijanumerorekisteri/yhteystietoryhma.types';
import { copy } from '../../../utilities/copy';
import { useState } from 'react';
import { KoodistoStateKoodi, useGetYhteystietotyypitQuery } from '../../../api/koodisto';

type OwnProps = {
    readOnly: boolean;
    view: View;
};

type StateProps = {
    L: Localisations;
    locale: Locale;
    omattiedot: OmattiedotState;
    henkilo: HenkiloState;
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

export function HenkiloViewContactContentComponent(props: Props) {
    const yhteystietotyypitQuery = useGetYhteystietotyypitQuery();

    function validateContactInfo(contactInfoLabel: string, contactInfoValue: string) {
        if (contactInfoLabel === EMAIL) {
            return validateEmail(contactInfoValue);
        }
        return true;
    }

    const _initialiseYhteystiedot = (
        henkiloUpdate: Henkilo,
        contactInfoTemplate: Array<{
            label: string;
            value?: string;
            inputValue?: string;
        }>,
        yhteystietotyypit: KoodistoStateKoodi[],
        locale: string
    ) =>
        henkiloUpdate.yhteystiedotRyhma?.map((yhteystiedotRyhma, idx) => {
            const yhteystietoFlatList = createFlatYhteystieto(
                contactInfoTemplate,
                yhteystiedotRyhma.yhteystieto,
                idx,
                yhteystiedotRyhma,
                yhteystietotyypit,
                locale
            );
            yhteystiedotRyhma.yhteystieto = yhteystietoFlatList.value?.map((yhteystietoFlat) => ({
                yhteystietoTyyppi: yhteystietoFlat.label,
                yhteystietoArvo: yhteystietoFlat.value,
            }));
            return yhteystietoFlatList;
        });

    const [henkiloUpdate, setHenkiloUpdate] = useState(copy(props.henkilo.henkilo));
    const contactInfoTemplate = [
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
    const [state, setState] = useState<State>({
        readOnly: props.readOnly,
        showPassive: false,
        contactInfo: _initialiseYhteystiedot(
            henkiloUpdate,
            contactInfoTemplate,
            yhteystietotyypitQuery.data ?? [],
            props.locale
        ),
        yhteystietoRemoveList: [],
        isContactInfoValid: true,
        modified: false,
        contactInfoErrorFields: [],
    });
    const [_preEditData, setPreEditData] = useState<{ contactInfo: Array<ContactInfo> }>();
    function _edit() {
        setState({ ...state, readOnly: false });
        setPreEditData({
            contactInfo: state.contactInfo,
        });
    }
    function _removeYhteystieto(id: (number | null | undefined) | (string | null | undefined)) {
        if (id) {
            setState({
                ...state,
                yhteystietoRemoveList: [...state.yhteystietoRemoveList, id],
                modified: true,
            });
        }
    }

    function _discard() {
        setHenkiloUpdate(copy(props.henkilo.henkilo));
        setState({
            ...state,
            readOnly: true,
            contactInfo: _preEditData.contactInfo,
            yhteystietoRemoveList: [],
            modified: false,
        });
    }
    function _updateModelField(
        contactInfo: {
            label: string;
            value: string;
            inputValue: string;
        },
        event: React.SyntheticEvent<HTMLInputElement>
    ) {
        const isContactInfoValid = validateContactInfo(contactInfo.label, event.currentTarget.value);
        StaticUtils.updateFieldByDotAnnotation(henkiloUpdate, event);
        let contactInfoErrorFields = state.contactInfoErrorFields;
        if (isContactInfoValid) {
            contactInfoErrorFields = contactInfoErrorFields.filter(
                (errorKeyValue) => errorKeyValue !== contactInfo.inputValue
            );
        } else {
            contactInfoErrorFields.push(contactInfo.inputValue);
        }

        setState({ ...state, modified: true, contactInfoErrorFields });
    }

    function _update() {
        state.yhteystietoRemoveList.forEach((yhteystietoId) =>
            henkiloUpdate.yhteystiedotRyhma.splice(
                henkiloUpdate.yhteystiedotRyhma.findIndex(
                    (yhteystieto) => yhteystieto.id === yhteystietoId || yhteystieto.henkiloUiId === yhteystietoId
                ),
                1
            )
        );
        setState({ ...state, yhteystietoRemoveList: [] });
        props.updateHenkiloAndRefetch(henkiloUpdate);
    }

    const isHidden = (group: ContactInfo): boolean =>
        isUnprivileged(props.omattiedot) && isVirkailija(props.henkilo.kayttaja) && isFromVTJ(group);

    const isVisible = (group: ContactInfo): boolean => !isHidden(group);

    function createContent() {
        const defaultWorkAddress = resolveDefaultWorkAddress(state.contactInfo, state.yhteystietoRemoveList);
        const content: Array<React.ReactNode> = state.contactInfo
            ?.filter(isVisible)
            .filter(excludeRemovedItems(state.yhteystietoRemoveList))
            .map((yhteystiedotRyhmaFlat, idx) => (
                <div key={idx}>
                    <span className="oph-h3 oph-bold midHeader">
                        {yhteystiedotRyhmaFlat.name} {yhteystiedotRyhmaFlat.id === defaultWorkAddress ? '*' : ''}
                    </span>
                    {!state.readOnly &&
                    !yhteystiedotRyhmaFlat.readOnly &&
                    !isLastWorkEmail(yhteystiedotRyhmaFlat, state.contactInfo, state.yhteystietoRemoveList) ? (
                        <span className="float-right">
                            <IconButton
                                onClick={() =>
                                    _removeYhteystieto(yhteystiedotRyhmaFlat.id || yhteystiedotRyhmaFlat.henkiloUiId)
                                }
                            >
                                <CrossIcon />
                            </IconButton>
                        </span>
                    ) : null}
                    {yhteystiedotRyhmaFlat.value.map((yhteystietoFlat, idx2) => (
                        <div key={idx2} id={yhteystietoFlat.label}>
                            {(!state.readOnly && !yhteystiedotRyhmaFlat.readOnly) || yhteystietoFlat.value ? (
                                <div
                                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}
                                    className="labelValue"
                                >
                                    <span className="oph-bold">{props.L[yhteystietoFlat.label]}</span>
                                    <Field
                                        inputValue={yhteystietoFlat.inputValue}
                                        changeAction={(e) => _updateModelField(yhteystietoFlat, e)}
                                        isEmail={isEmail(yhteystietoFlat)}
                                        readOnly={yhteystiedotRyhmaFlat.readOnly || state.readOnly}
                                    >
                                        {yhteystietoFlat.value}
                                    </Field>
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            ));
        if (!state.readOnly) {
            content.push(
                <div
                    className="contact-content-add-new"
                    onClick={() => _createYhteystiedotRyhma(WORK_ADDRESS)}
                    key="add-new"
                >
                    <span className="oph-bold oph-blue-lighten-1">
                        <AddIcon /> {props.L['HENKILO_LUOYHTEYSTIETO']}
                    </span>
                </div>
            );
        }
        return content;
    }

    function createFlatYhteystieto(
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

    const passivoitu = props.henkilo.henkilo.passivoitu;
    const duplicate = props.henkilo.henkilo.duplicate;
    const hasHenkiloReadUpdateRights: boolean =
        props.view === 'omattiedot'
            ? true
            : hasAnyPalveluRooli(props.omattiedot.organisaatiot, [
                  'OPPIJANUMEROREKISTERI_HENKILON_RU',
                  'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
              ]);

    const editButton = hasHenkiloReadUpdateRights ? (
        <Button disabled={passivoitu || duplicate} key="contactEdit" action={_edit}>
            {props.L['MUOKKAA_LINKKI']}
        </Button>
    ) : null;

    return (
        <div className="henkiloViewUserContentWrapper contact-content">
            <div>
                <div className="header">
                    <p className="oph-h2 oph-bold">{props.L['HENKILO_YHTEYSTIEDOT_OTSIKKO']}</p>
                </div>
                {props.henkilo.henkilo.turvakielto ? (
                    <div className="oph-h3 oph-bold midHeader">{props.L['YHTEYSTIETO_TURVAKIELTO']}</div>
                ) : null}

                <div className="henkiloViewContent">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                        {createContent()}
                    </div>
                </div>
            </div>
            {state.readOnly ? (
                <div className="henkiloViewButtons">{editButton}</div>
            ) : (
                <div className="henkiloViewEditButtons">
                    <EditButtons
                        discardAction={_discard}
                        updateAction={_update}
                        isValidForm={state.modified && state.contactInfoErrorFields.length === 0}
                    />
                </div>
            )}
        </div>
    );

    function _createYhteystiedotRyhma(yhteystietoryhmaTyyppi: string) {
        const henkiloUiId = 'henkilo_ui_id_' + PropertySingleton.getNewId();
        const newYhteystiedotRyhma = {
            readOnly: false,
            ryhmaAlkuperaTieto: PropertySingleton.state.YHTEYSTIETO_ALKUPERA_VIRKAILIJA_UI,
            ryhmaKuvaus: yhteystietoryhmaTyyppi,
            yhteystieto: contactInfoTemplate.map((template) => ({
                yhteystietoTyyppi: template.label,
            })),
            henkiloUiId: henkiloUiId,
            id: null,
        };
        henkiloUpdate.yhteystiedotRyhma.push(newYhteystiedotRyhma);
        const contactInfo = [
            ...state.contactInfo,
            createFlatYhteystieto(
                contactInfoTemplate,
                [],
                henkiloUpdate.yhteystiedotRyhma.length - 1,
                newYhteystiedotRyhma,
                yhteystietotyypitQuery.data ?? [],
                props.locale,
                henkiloUiId
            ),
        ];
        setState({
            ...state,
            contactInfo: contactInfo,
            modified: true,
        });
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
    omattiedot: state.omattiedot,
    henkilo: state.henkilo,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    updateHenkiloAndRefetch,
})(HenkiloViewContactContentComponent);
