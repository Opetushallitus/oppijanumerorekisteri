import './HenkiloViewContactContent.css';
import React, { useEffect, useId, useMemo, useState } from 'react';

import Field from '../field/Field';
import Button from '../button/Button';
import StaticUtils from '../StaticUtils';
import EditButtons from './buttons/EditButtons';
import PropertySingleton from '../../../globals/PropertySingleton';
import AddIcon from '../icons/AddIcon';
import IconButton from '../button/IconButton';
import CrossIcon from '../icons/CrossIcon';
import type { Henkilo } from '../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { hasAnyPalveluRooli } from '../../../utilities/palvelurooli.util';
import { validateEmail } from '../../../validation/EmailValidator';
import { WORK_ADDRESS, EMAIL, View } from '../../../types/constants';
import { Yhteystieto } from '../../../types/domain/oppijanumerorekisteri/yhteystieto.types';
import { YhteystietoRyhma } from '../../../types/domain/oppijanumerorekisteri/yhteystietoryhma.types';
import { copy } from '../../../utilities/copy';
import { KoodistoStateKoodi, useGetYhteystietotyypitQuery } from '../../../api/koodisto';
import { useAppDispatch } from '../../../store';
import { useLocalisations } from '../../../selectors';
import { useGetKayttajatiedotQuery, useGetOmattiedotQuery } from '../../../api/kayttooikeus';
import { KayttajatiedotRead } from '../../../types/domain/kayttooikeus/KayttajatiedotRead';
import { useGetHenkiloQuery, useUpdateHenkiloMutation } from '../../../api/oppijanumerorekisteri';
import { add } from '../../../slices/toastSlice';
import Loader from '../icons/Loader';

type OwnProps = {
    readOnly: boolean;
    henkiloOid: string;
    view: View;
};

export type ContactInfo = {
    id?: number | null;
    type: string;
    henkiloUiId?: string;
    name: string;
    readOnly: boolean;
    alkupera: string;
    value: Array<{ label: string; value: string; inputValue: string }>;
};

type ContactInfoTemplate = {
    label: string;
    value?: string | null;
    inputValue?: string | null;
}[];

type State = {
    readOnly: boolean;
    showPassive: boolean;
    contactInfo: Array<ContactInfo>;
    yhteystietoRemoveList: Array<number | string>;
    modified: boolean;
    contactInfoErrorFields: Array<string>;
    isContactInfoValid: boolean;
};

const isEmail = ({ label }: { label: string }) => label === EMAIL;

const containsEmail = (infoGroup: ContactInfo): boolean =>
    !!infoGroup.value.filter((info) => isEmail(info)).filter((info) => info.value).length;

const isWorkEmail = (infoGroup: ContactInfo): boolean =>
    !!infoGroup.id && infoGroup.type === WORK_ADDRESS && containsEmail(infoGroup);

const excludeRemovedItems =
    (removeList: Array<number | string>) =>
    (infoGroup: ContactInfo): boolean =>
        !!infoGroup.id &&
        !removeList.includes(infoGroup.id) &&
        !!infoGroup.henkiloUiId &&
        !removeList.includes(infoGroup.henkiloUiId);

const resolveWorkAddresses = (contactInfo: Array<ContactInfo>, removeList: Array<number | string>) =>
    (contactInfo || []).filter((infoGroup) => isWorkEmail(infoGroup)).filter(excludeRemovedItems(removeList));

export const resolveDefaultWorkAddress = (contactInfo: Array<ContactInfo>, removeList: Array<number | string>) =>
    resolveWorkAddresses(contactInfo, removeList).reduce(
        (acc, infoGroup) => (infoGroup.id && infoGroup.id > acc ? infoGroup.id : acc),
        0
    );

export const isLastWorkEmail = (
    infoGroup: ContactInfo,
    contactInfo: Array<ContactInfo>,
    removeList: Array<number | string>
): boolean => isWorkEmail(infoGroup) && resolveWorkAddresses(contactInfo, removeList).length === 1;

const isVirkailija = (kayttaja?: KayttajatiedotRead): boolean => kayttaja?.kayttajaTyyppi === 'VIRKAILIJA';
const isFromVTJ = (group: ContactInfo): boolean => group.alkupera === PropertySingleton.state.YHTEYSTIETO_ALKUPERA_VTJ;

function validateContactInfo(contactInfoLabel: string, contactInfoValue: string) {
    if (contactInfoLabel === EMAIL) {
        return validateEmail(contactInfoValue);
    }
    return true;
}

function createFlatYhteystieto(
    contactInfoTemplate: ContactInfoTemplate,
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
                yhteystietoList.filter((yhteystieto) => yhteystieto.yhteystietoTyyppi === template.label)[0]
                    ?.yhteystietoArvo ?? '',
            inputValue: 'yhteystiedotRyhma.' + idx + '.yhteystieto.' + idx2 + '.yhteystietoArvo',
        })),
        name:
            (yhteystiedotRyhma.ryhmaKuvaus &&
                yhteystietotyypit?.filter((kieli) => kieli.value === yhteystiedotRyhma.ryhmaKuvaus)?.[0]?.[locale]) ||
            '',
        readOnly: !!yhteystiedotRyhma.readOnly,
        id: yhteystiedotRyhma.id,
        henkiloUiId: henkiloUiId,
        type: yhteystiedotRyhma.ryhmaKuvaus,
        alkupera: yhteystiedotRyhma.ryhmaAlkuperaTieto ?? '',
    };
}

const _initialiseYhteystiedot = (
    contactInfoTemplate: ContactInfoTemplate,
    yhteystietotyypit: KoodistoStateKoodi[],
    locale: string,
    henkiloUpdate?: Partial<Henkilo>
) =>
    henkiloUpdate?.yhteystiedotRyhma?.map((yhteystiedotRyhma, idx) => {
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
    }) ?? [];

const contactInfoTemplate: ContactInfoTemplate = [
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
    const { data: henkilo, isLoading: isHenkiloLoading } = useGetHenkiloQuery(props.henkiloOid);
    const [putHenkilo] = useUpdateHenkiloMutation();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: kayttajatiedot } = useGetKayttajatiedotQuery(props.henkiloOid);
    const [henkiloUpdate, setHenkiloUpdate] = useState<Partial<Henkilo>>({});
    const [state, setState] = useState<State>({
        readOnly: props.readOnly,
        showPassive: false,
        contactInfo: _initialiseYhteystiedot(
            contactInfoTemplate,
            yhteystietotyypitQuery.data ?? [],
            locale,
            henkiloUpdate
        ),
        yhteystietoRemoveList: [],
        isContactInfoValid: true,
        modified: false,
        contactInfoErrorFields: [],
    });
    const [_preEditData, setPreEditData] = useState<{ contactInfo: Array<ContactInfo> }>();
    const hasHenkiloReadUpdateRights = useMemo(() => {
        return props.view === 'omattiedot'
            ? true
            : hasAnyPalveluRooli(omattiedot?.organisaatiot, [
                  'OPPIJANUMEROREKISTERI_HENKILON_RU',
                  'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
              ]);
    }, [props.view, omattiedot]);

    useEffect(() => {
        if (henkilo) {
            setHenkiloUpdate(copy(henkilo));
        }
    }, [henkilo]);

    useEffect(() => {
        setState({
            ...state,
            contactInfo: _initialiseYhteystiedot(
                contactInfoTemplate,
                yhteystietotyypitQuery.data ?? [],
                locale,
                henkiloUpdate
            ),
        });
    }, [yhteystietotyypitQuery.data, henkilo]);

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
        if (henkilo) {
            setHenkiloUpdate(copy(henkilo));
        }
        setState({
            ...state,
            readOnly: true,
            contactInfo: _preEditData?.contactInfo ?? [],
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

    async function _update() {
        state.yhteystietoRemoveList.forEach((yhteystietoId) =>
            henkiloUpdate.yhteystiedotRyhma?.splice(
                henkiloUpdate.yhteystiedotRyhma.findIndex(
                    (yhteystieto) => yhteystieto.id === yhteystietoId || yhteystieto.henkiloUiId === yhteystietoId
                ),
                1
            )
        );
        setState({ ...state, yhteystietoRemoveList: [] });

        putHenkilo(henkiloUpdate)
            .unwrap()
            .then(() => {
                setState({ ...state, readOnly: true });
                dispatch(
                    add({
                        id: `henkilo-update-ok-${Math.random()}`,
                        type: 'ok',
                        header: L['HENKILO_YHTEYSTIEDOT_OTSIKKO'],
                    })
                );
            })
            .catch(() =>
                dispatch(
                    add({
                        id: `henkilo-update-failed-${Math.random()}`,
                        type: 'error',
                        header: L['NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE'],
                    })
                )
            );
    }

    function _createYhteystiedotRyhma(yhteystietoryhmaTyyppi: string) {
        const henkiloUiId = 'henkilo_ui_id_' + PropertySingleton.getNewId();
        const newYhteystiedotRyhma: YhteystietoRyhma = {
            readOnly: false,
            ryhmaAlkuperaTieto: PropertySingleton.state.YHTEYSTIETO_ALKUPERA_VIRKAILIJA_UI,
            ryhmaKuvaus: yhteystietoryhmaTyyppi,
            yhteystieto: contactInfoTemplate.map((template) => ({
                yhteystietoArvo: '',
                yhteystietoTyyppi: template.label,
            })),
            henkiloUiId: henkiloUiId,
            id: null,
        };
        henkiloUpdate?.yhteystiedotRyhma?.push(newYhteystiedotRyhma);
        const contactInfo = [
            ...state.contactInfo,
            createFlatYhteystieto(
                contactInfoTemplate,
                [],
                henkiloUpdate.yhteystiedotRyhma?.length ?? 1 - 1,
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
    const sectionLabelId = useId();

    if (isHenkiloLoading) {
        return <Loader />;
    }

    return (
        <section aria-labelledby={sectionLabelId} className="henkiloViewUserContentWrapper contact-content">
            <div>
                <h2 id={sectionLabelId}>{L['HENKILO_YHTEYSTIEDOT_OTSIKKO']}</h2>
                {henkilo?.turvakielto ? (
                    <div className="oph-h3 oph-bold midHeader">{L['YHTEYSTIETO_TURVAKIELTO']}</div>
                ) : null}

                <div className="henkiloViewContent">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                        {state.contactInfo
                            ?.filter((c) => omattiedot?.isAdmin || !isVirkailija(kayttajatiedot) || !isFromVTJ(c))
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
                        <Button disabled={henkilo?.passivoitu || henkilo?.duplicate} key="contactEdit" action={_edit}>
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
        </section>
    );
}

export default HenkiloViewContactContentComponent;
