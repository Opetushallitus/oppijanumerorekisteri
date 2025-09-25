import './HenkiloViewContactContent.css';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Field from '../field/Field';
import Button from '../button/Button';
import StaticUtils from '../StaticUtils';
import EditButtons from './buttons/EditButtons';
import PropertySingleton from '../../../globals/PropertySingleton';
import AddIcon from '../icons/AddIcon';
import IconButton from '../button/IconButton';
import CrossIcon from '../icons/CrossIcon';
import type { HenkiloState } from '../../../reducers/henkilo.reducer';
import type { Henkilo } from '../../../types/domain/oppijanumerorekisteri/henkilo.types';
import type { Kayttaja } from '../../../types/domain/kayttooikeus/kayttaja.types';
import { hasAnyPalveluRooli } from '../../../utilities/palvelurooli.util';
import type { OmattiedotState } from '../../../reducers/omattiedot.reducer';
import { validateEmail } from '../../../validation/EmailValidator';
import { WORK_ADDRESS, EMAIL, View } from '../../../types/constants';
import { Yhteystieto } from '../../../types/domain/oppijanumerorekisteri/yhteystieto.types';
import { YhteystietoRyhma } from '../../../types/domain/oppijanumerorekisteri/yhteystietoryhma.types';
import { copy } from '../../../utilities/copy';
import { KoodistoStateKoodi, useGetYhteystietotyypitQuery } from '../../../api/koodisto';
import { RootState, useAppDispatch } from '../../../store';
import { updateHenkiloAndRefetch } from '../../../actions/henkilo.actions';
import { useLocalisations } from '../../../selectors';

type OwnProps = {
    readOnly: boolean;
    view: View;
};

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

const isVirkailija = (kayttaja: Kayttaja): boolean => kayttaja.kayttajaTyyppi === 'VIRKAILIJA';
const isFromVTJ = (group: ContactInfo): boolean => group.alkupera === PropertySingleton.state.YHTEYSTIETO_ALKUPERA_VTJ;

function validateContactInfo(contactInfoLabel: string, contactInfoValue: string) {
    if (contactInfoLabel === EMAIL) {
        return validateEmail(contactInfoValue);
    }
    return true;
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
            yhteystietotyypit?.filter((kieli) => kieli.value === yhteystiedotRyhma.ryhmaKuvaus)?.[0]?.[locale],
        readOnly: yhteystiedotRyhma.readOnly,
        id: yhteystiedotRyhma.id,
        henkiloUiId: henkiloUiId,
        type: yhteystiedotRyhma.ryhmaKuvaus,
        alkupera: yhteystiedotRyhma.ryhmaAlkuperaTieto,
    };
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

export function HenkiloViewContactContentComponent(props: OwnProps) {
    const yhteystietotyypitQuery = useGetYhteystietotyypitQuery();
    const dispatch = useAppDispatch();
    const { locale, L } = useLocalisations();
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const omattiedot = useSelector<RootState, OmattiedotState>((state) => state.omattiedot);
    const [henkiloUpdate, setHenkiloUpdate] = useState(copy(henkilo.henkilo));
    const [state, setState] = useState<State>({
        readOnly: props.readOnly,
        showPassive: false,
        contactInfo: _initialiseYhteystiedot(
            henkiloUpdate,
            contactInfoTemplate,
            yhteystietotyypitQuery.data ?? [],
            locale
        ),
        yhteystietoRemoveList: [],
        isContactInfoValid: true,
        modified: false,
        contactInfoErrorFields: [],
    });
    const [_preEditData, setPreEditData] = useState<{ contactInfo: Array<ContactInfo> }>();

    useEffect(() => {
        setState({
            ...state,
            contactInfo: _initialiseYhteystiedot(
                henkiloUpdate,
                contactInfoTemplate,
                yhteystietotyypitQuery.data ?? [],
                locale
            ),
        });
    }, [yhteystietotyypitQuery.data]);

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
        setHenkiloUpdate(copy(henkilo.henkilo));
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
        dispatch<any>(updateHenkiloAndRefetch(henkiloUpdate, undefined));
    }

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
                locale,
                henkiloUiId
            ),
        ];
        setState({
            ...state,
            contactInfo: contactInfo,
            modified: true,
        });
    }

    const defaultWorkAddress = resolveDefaultWorkAddress(state.contactInfo, state.yhteystietoRemoveList);
    const passivoitu = henkilo.henkilo.passivoitu;
    const duplicate = henkilo.henkilo.duplicate;
    const hasHenkiloReadUpdateRights: boolean =
        props.view === 'omattiedot'
            ? true
            : hasAnyPalveluRooli(omattiedot.organisaatiot, [
                  'OPPIJANUMEROREKISTERI_HENKILON_RU',
                  'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
              ]);

    return (
        <div className="henkiloViewUserContentWrapper contact-content">
            <div>
                <h2>{L['HENKILO_YHTEYSTIEDOT_OTSIKKO']}</h2>
                {henkilo.henkilo.turvakielto ? (
                    <div className="oph-h3 oph-bold midHeader">{L['YHTEYSTIETO_TURVAKIELTO']}</div>
                ) : null}

                <div className="henkiloViewContent">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                        {state.contactInfo
                            ?.filter((c) => omattiedot.isAdmin || !isVirkailija(henkilo.kayttaja) || !isFromVTJ(c))
                            .filter(excludeRemovedItems(state.yhteystietoRemoveList))
                            .map((yhteystiedotRyhmaFlat, idx) => (
                                <div key={idx}>
                                    <span className="oph-h3 oph-bold midHeader">
                                        {yhteystiedotRyhmaFlat.name}{' '}
                                        {yhteystiedotRyhmaFlat.id === defaultWorkAddress ? '*' : ''}
                                    </span>
                                    {!state.readOnly &&
                                    !yhteystiedotRyhmaFlat.readOnly &&
                                    !isLastWorkEmail(
                                        yhteystiedotRyhmaFlat,
                                        state.contactInfo,
                                        state.yhteystietoRemoveList
                                    ) ? (
                                        <span className="float-right">
                                            <IconButton
                                                onClick={() =>
                                                    _removeYhteystieto(
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
                                            {(!state.readOnly && !yhteystiedotRyhmaFlat.readOnly) ||
                                            yhteystietoFlat.value ? (
                                                <div
                                                    style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '1fr 1fr',
                                                        gap: '25px',
                                                    }}
                                                    className="labelValue"
                                                >
                                                    <span className="oph-bold">{L[yhteystietoFlat.label]}</span>
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
                            ))}
                        {!state.readOnly && (
                            <div
                                className="contact-content-add-new"
                                onClick={() => _createYhteystiedotRyhma(WORK_ADDRESS)}
                                key="add-new"
                            >
                                <span className="oph-bold oph-blue-lighten-1">
                                    <AddIcon /> {L['HENKILO_LUOYHTEYSTIETO']}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {state.readOnly ? (
                <div className="henkiloViewButtons">
                    {hasHenkiloReadUpdateRights ? (
                        <Button disabled={passivoitu || duplicate} key="contactEdit" action={_edit}>
                            {L['MUOKKAA_LINKKI']}
                        </Button>
                    ) : null}
                </div>
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
}

export default HenkiloViewContactContentComponent;
