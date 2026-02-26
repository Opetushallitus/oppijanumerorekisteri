import React, { useEffect, useState } from 'react';
import { SingleValue } from 'react-select';
import { format } from 'date-fns';
import { useNavigate } from 'react-router';

import { useAppDispatch } from '../../../../store';
import { updateFieldByDotAnnotation, updateSelectValueByDotAnnotation } from '../../StaticUtils';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import OppijaUserContent from './OppijaUserContent';
import AdminUserContent from './AdminUserContent';
import VirkailijaUserContent from './VirkailijaUserContent';
import OmattiedotUserContent from './OmattiedotUserContent';
import { isValidKutsumanimi } from '../../../../validation/KutsumanimiValidator';
import { LocalNotification } from '../../Notification/LocalNotification';
import { isValidKayttajatunnus } from '../../../../validation/KayttajatunnusValidator';
import { View } from '../../../../types/constants';
import { copy } from '../../../../utilities/copy';
import { NamedMultiSelectOption, NamedSelectOption } from '../../../../utilities/select';
import { useLocalisations } from '../../../../selectors';
import {
    useGetKayttajatiedotQuery,
    useGetOmattiedotQuery,
    usePutAnomusilmoitusMutation,
    usePutKayttajatiedotMutation,
} from '../../../../api/kayttooikeus';
import { add } from '../../../../slices/toastSlice';
import {
    useGetHenkiloQuery,
    useGetYksilointitiedotQuery,
    useUpdateHenkiloMutation,
} from '../../../../api/oppijanumerorekisteri';
import { isApiError } from '../../../../api/common';
import { enabledVtjVertailuView, vtjDataAvailable } from '../../../navigation/NavigationTabs';

type OwnProps = {
    oidHenkilo: string;
    view: View;
    isOppija?: boolean;
};

const yksilointivirheMap = {
    HETU_EI_OIKEA: 'HENKILO_YKSILOINTIVIRHE_HETU_EI_OIKEA',
    HETU_EI_VTJ: 'HENKILO_YKSILOINTIVIRHE_HETU_EI_VTJ',
    HETU_PASSIVOITU: 'HENKILO_YKSILOINTIVIRHE_HETU_PASSIVOITU',
    MUU_UUDELLEENYRITETTAVA: 'HENKILO_YKSILOINTIVIRHE_MUU_UUDELLEENYRITETTAVA',
    MUU: 'HENKILO_YKSILOINTIVIRHE_MUU',
};

export const UserContentContainer = ({ oidHenkilo, view, isOppija }: OwnProps) => {
    const { L } = useLocalisations();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { data: henkilo } = useGetHenkiloQuery(oidHenkilo);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: kayttajatiedot } = useGetKayttajatiedotQuery(oidHenkilo, { skip: isOppija });
    const vtjVertailuEnabled = enabledVtjVertailuView(henkilo);
    const { data: yksilointitiedot } = useGetYksilointitiedotQuery(oidHenkilo, { skip: !vtjVertailuEnabled });
    const [putKayttajatiedot] = usePutKayttajatiedotMutation();
    const [putAnomusilmoitus] = usePutAnomusilmoitusMutation();
    const [putHenkilo] = useUpdateHenkiloMutation();
    const [readOnly, setReadOnly] = useState(true);
    const [henkiloUpdate, setHenkiloUpdate] = useState<any>({
        ...(henkilo
            ? { ...copy(henkilo), anomusilmoitus: omattiedot?.anomusilmoitus }
            : { anomusilmoitus: omattiedot?.anomusilmoitus }),
    });

    useEffect(() => {
        setHenkiloUpdate({
            ...(henkilo
                ? { ...copy(henkilo), anomusilmoitus: omattiedot?.anomusilmoitus }
                : { anomusilmoitus: omattiedot?.anomusilmoitus }),
        });
    }, [henkilo, omattiedot]);

    useEffect(() => {
        if (kayttajatiedot?.kayttajaTyyppi === 'PALVELU') {
            navigate(`/jarjestelmatunnus/${oidHenkilo}`, { replace: true });
        }
    }, [kayttajatiedot]);

    function _edit() {
        setReadOnly(false);
    }

    function _additionalInfo() {
        const info = [];
        if (henkilo?.yksiloity) {
            info.push(L('HENKILO_ADDITIONALINFO_YKSILOITY'));
        }
        if (henkilo?.yksiloityEidas) {
            info.push(L('HENKILO_ADDITIONALINFO_YKSILOITYEIDAS'));
        }
        if (henkilo?.yksiloityVTJ) {
            info.push(L('HENKILO_ADDITIONALINFO_YKSILOITYVTJ'));
        }
        if (!henkilo?.yksiloity && !henkilo?.yksiloityVTJ && !henkilo?.yksiloityEidas) {
            info.push(L('HENKILO_ADDITIOINALINFO_EIYKSILOITY'));
        }
        if (henkilo?.duplicate) {
            info.push(L('HENKILO_ADDITIONALINFO_DUPLIKAATTI'));
        }
        if (henkilo?.passivoitu) {
            info.push(L('PASSIVOI_PASSIVOITU'));
        }
        return info.length ? ' (' + info.join(', ') + ')' : '';
    }

    function _discard() {
        const henkiloUpdate = copy(henkilo);
        if (henkiloUpdate) {
            henkiloUpdate.anomusilmoitus = omattiedot?.anomusilmoitus;
        }
        setHenkiloUpdate(henkiloUpdate);
        setReadOnly(true);
    }

    async function _update() {
        const newHenkiloUpdate = Object.assign({}, henkiloUpdate);
        await updateAnomusilmoitus(newHenkiloUpdate);
        if (newHenkiloUpdate.kayttajanimi !== undefined) {
            await updateKayttajatiedot(newHenkiloUpdate.oid, newHenkiloUpdate.kayttajanimi);
        }
        await updateHenkilo(newHenkiloUpdate);
        setReadOnly(true);
    }

    async function updateHenkilo(henkiloUpdate: Henkilo) {
        return putHenkilo(henkiloUpdate)
            .unwrap()
            .catch((error) => {
                const errorMessages = [];
                if (error.status === 400 && error.data.includes('invalid.hetu')) {
                    errorMessages.push(L('NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE_HETU'));
                }
                if (error.status === 400 && error.data.includes('socialsecuritynr.already.exists')) {
                    errorMessages.push(L('NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE_HETU_KAYTOSSA'));
                }
                if (errorMessages.length > 0) {
                    errorMessages.forEach((errorMessage) =>
                        dispatch(
                            add({
                                id: `henkilo-update-failed-${Math.random()}`,
                                type: 'error',
                                header: errorMessage,
                            })
                        )
                    );
                } else {
                    dispatch(
                        add({
                            id: `henkilo-update-failed-${Math.random()}`,
                            type: 'error',
                            header: L('NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE'),
                        })
                    );
                }
            });
    }

    async function updateAnomusilmoitus(henkiloUpdate: Henkilo) {
        if (view === 'omattiedot' && omattiedot?.isAdmin) {
            const initialAnomusilmoitusValue = omattiedot.anomusilmoitus;
            return putAnomusilmoitus({
                oid: henkiloUpdate.oidHenkilo,
                anomusilmoitus: henkiloUpdate.anomusilmoitus ?? [],
            })
                .unwrap()
                .catch(() => {
                    setHenkiloUpdate({
                        ...henkiloUpdate,
                        anomusilmoitus: initialAnomusilmoitusValue,
                    });
                });
        }
    }

    async function updateKayttajatiedot(oid: string, username: string) {
        return putKayttajatiedot({ oid, username })
            .unwrap()
            .catch((error) => {
                const errorKey =
                    isApiError(error) && error.data.message.includes('username_unique')
                        ? 'NOTIFICATION_HENKILOTIEDOT_KAYTTAJANIMI_EXISTS'
                        : 'NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE';
                dispatch(
                    add({
                        id: `put-kayttajatiedot-${Math.random()}`,
                        type: 'error',
                        header: L(errorKey),
                    })
                );
            });
    }

    function _updateModelField(event: React.SyntheticEvent<HTMLInputElement>) {
        const newHenkiloUpdate = { ...updateFieldByDotAnnotation(henkiloUpdate, event) };
        setHenkiloUpdate(newHenkiloUpdate);
    }

    function _updateModelSelectValue(event: SingleValue<NamedSelectOption> | NamedMultiSelectOption) {
        const newHenkiloUpdate = { ...updateSelectValueByDotAnnotation(henkiloUpdate, event) };
        setHenkiloUpdate(newHenkiloUpdate);
    }

    const _validForm = (): boolean => {
        return _validKutsumanimi() && _validKayttajatunnus();
    };

    const _validKutsumanimi = (): boolean => {
        const etunimet = henkiloUpdate.etunimet;
        const kutsumanimi = henkiloUpdate.kutsumanimi;
        return isValidKutsumanimi(etunimet, kutsumanimi);
    };

    const _validKayttajatunnus = (): boolean => {
        const kayttajatunnus = henkiloUpdate.kayttajanimi;
        return !kayttajatunnus || isValidKayttajatunnus(kayttajatunnus);
    };

    function _validYksilointi() {
        return !henkilo?.yksilointivirheet?.length;
    }

    function _getYksilointivirhe() {
        const virhe = henkilo?.yksilointivirheet?.[0];
        const virheKey = (virhe && yksilointivirheMap[virhe.yksilointivirheTila]) || 'HENKILO_YKSILOINTIVIRHE_OLETUS';
        return virhe?.uudelleenyritysAikaleima
            ? `${L(virheKey)} ${L('HENKILO_YKSILOINTIVIRHE_UUDELLEENYRITYS')} ${format(
                  new Date(virhe?.uudelleenyritysAikaleima),
                  'd.M.yyyy H:mm'
              )}`
            : L(virheKey);
    }

    let content;
    if (view === 'oppija') {
        content = (
            <OppijaUserContent
                readOnly={readOnly}
                discardAction={_discard}
                updateAction={_update}
                updateModelAction={_updateModelField}
                updateModelSelectAction={_updateModelSelectValue}
                updateDateAction={_updateModelField}
                henkiloUpdate={henkiloUpdate}
                edit={_edit}
                oidHenkilo={oidHenkilo}
                isValidForm={_validForm()}
            />
        );
    } else if (view === 'admin') {
        content = (
            <AdminUserContent
                readOnly={readOnly}
                discardAction={_discard}
                updateAction={_update}
                updateModelAction={_updateModelField}
                updateModelSelectAction={_updateModelSelectValue}
                updateDateAction={_updateModelField}
                henkiloUpdate={henkiloUpdate}
                edit={_edit}
                oidHenkilo={oidHenkilo}
                isValidForm={_validForm()}
            />
        );
    } else if (view === 'virkailija') {
        content = (
            <VirkailijaUserContent
                readOnly={readOnly}
                discardAction={_discard}
                updateAction={_update}
                updateModelAction={_updateModelField}
                updateModelSelectAction={_updateModelSelectValue}
                updateDateAction={_updateModelField}
                henkiloUpdate={henkiloUpdate}
                edit={_edit}
                oidHenkilo={oidHenkilo}
                isValidForm={_validForm()}
            />
        );
    } else if (view === 'omattiedot') {
        content = (
            <OmattiedotUserContent
                readOnly={readOnly}
                discardAction={_discard}
                updateAction={_update}
                updateModelAction={_updateModelField}
                updateModelSelectAction={_updateModelSelectValue}
                updateDateAction={_updateModelField}
                henkiloUpdate={henkiloUpdate}
                edit={_edit}
                oidHenkilo={oidHenkilo}
                isValidForm={_validForm()}
            />
        );
    } else {
        throw new Error(`Unidentified view ${view}`);
    }

    return (
        <section aria-label={L('HENKILO_PERUSTIEDOT_OTSIKKO')} className="henkiloViewUserContentWrapper">
            <h2>{L('HENKILO_PERUSTIEDOT_OTSIKKO') + _additionalInfo()}</h2>
            {content}

            <LocalNotification
                title={L('NOTIFICATION_HENKILOTIEDOT_VIRHE_OTSIKKO')}
                type="warning"
                toggle={!readOnly && !_validForm()}
            >
                <ul>{_validKutsumanimi() ? null : <li>{L('NOTIFICATION_HENKILOTIEDOT_KUTSUMANIMI_VIRHE')}</li>}</ul>
                <ul>
                    {_validKayttajatunnus() ? null : <li>{L('NOTIFICATION_HENKILOTIEDOT_KAYTTAJATUNNUS_VIRHE')}</li>}
                </ul>
            </LocalNotification>
            <LocalNotification title={L('HENKILO_YKSILOINTIVIRHE_OTSIKKO')} type="error">
                <ul>{_validYksilointi() ? null : <li>{_getYksilointivirhe()}</li>}</ul>
            </LocalNotification>
            {vtjVertailuEnabled && vtjDataAvailable(yksilointitiedot) && (
                <LocalNotification title={L('HENKILO_YKSILOINTIVIRHE_OTSIKKO')} type="error">
                    <ul>
                        <li>{L('HENKILO_YKSILOINTIVIRHE_NIMITIEDOT')}</li>
                    </ul>
                </LocalNotification>
            )}
        </section>
    );
};
