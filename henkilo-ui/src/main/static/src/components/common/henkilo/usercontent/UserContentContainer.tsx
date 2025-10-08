import React, { useEffect, useId, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';

import { useAppDispatch, type RootState } from '../../../../store';
import StaticUtils from '../../StaticUtils';
import { Henkilo } from '../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import OppijaUserContent from './OppijaUserContent';
import AdminUserContent from './AdminUserContent';
import VirkailijaUserContent from './VirkailijaUserContent';
import OmattiedotUserContent from './OmattiedotUserContent';
import PalveluUserContent from './PalveluUserContent';
import { isValidKutsumanimi } from '../../../../validation/KutsumanimiValidator';
import { LocalNotification } from '../../Notification/LocalNotification';
import { NOTIFICATIONTYPES } from '../../Notification/notificationtypes';
import { isValidKayttajatunnus } from '../../../../validation/KayttajatunnusValidator';
import PropertySingleton from '../../../../globals/PropertySingleton';
import { View } from '../../../../types/constants';
import { copy } from '../../../../utilities/copy';
import { NamedMultiSelectOption, NamedSelectOption } from '../../../../utilities/select';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { useLocalisations } from '../../../../selectors';
import {
    useGetKayttajatiedotQuery,
    useGetOmattiedotQuery,
    usePutAnomusilmoitusMutation,
    usePutKayttajatiedotMutation,
} from '../../../../api/kayttooikeus';
import { add } from '../../../../slices/toastSlice';
import { useUpdateHenkiloMutation } from '../../../../api/oppijanumerorekisteri';
import { fetchHenkilo } from '../../../../actions/henkilo.actions';

type OwnProps = {
    oidHenkilo: string;
    view: View;
    isOppija?: boolean;
};

export const UserContentContainer = ({ oidHenkilo, view, isOppija }: OwnProps) => {
    const { L } = useLocalisations();
    const dispatch = useAppDispatch();
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: kayttajatiedot } = useGetKayttajatiedotQuery(oidHenkilo, { skip: isOppija });
    const [putKayttajatiedot] = usePutKayttajatiedotMutation();
    const [putAnomusilmoitus] = usePutAnomusilmoitusMutation();
    const [putHenkilo] = useUpdateHenkiloMutation();
    const [readOnly, setReadOnly] = useState(true);
    const [henkiloUpdate, setHenkiloUpdate] = useState<any>({
        ...(henkilo.henkilo
            ? { ...copy(henkilo.henkilo), anomusilmoitus: omattiedot?.anomusilmoitus }
            : { anomusilmoitus: omattiedot?.anomusilmoitus }),
    });

    useEffect(() => {
        setHenkiloUpdate({
            ...(henkilo.henkilo
                ? { ...copy(henkilo.henkilo), anomusilmoitus: omattiedot?.anomusilmoitus }
                : { anomusilmoitus: omattiedot?.anomusilmoitus }),
        });
    }, [henkilo, omattiedot]);

    function _edit() {
        setReadOnly(false);
    }

    function _additionalInfo() {
        const info = [];
        if (kayttajatiedot?.kayttajaTyyppi === 'PALVELU') {
            info.push(L['HENKILO_ADDITIOINALINFO_PALVELU']);
        } else {
            if (henkilo.henkilo.yksiloity) {
                info.push(L['HENKILO_ADDITIONALINFO_YKSILOITY']);
            }
            if (henkilo.henkilo.yksiloityVTJ) {
                info.push(L['HENKILO_ADDITIONALINFO_YKSILOITYVTJ']);
            }
            if (!henkilo.henkilo.yksiloity && !henkilo.henkilo.yksiloityVTJ) {
                info.push(L['HENKILO_ADDITIOINALINFO_EIYKSILOITY']);
            }
        }
        if (henkilo.henkilo.duplicate) {
            info.push(L['HENKILO_ADDITIONALINFO_DUPLIKAATTI']);
        }
        if (henkilo.henkilo.passivoitu) {
            info.push(L['PASSIVOI_PASSIVOITU']);
        }
        return info.length ? ' (' + info.join(', ') + ')' : '';
    }

    function _discard() {
        const henkiloUpdate = copy(henkilo.henkilo);
        henkiloUpdate.anomusilmoitus = omattiedot?.anomusilmoitus;
        setHenkiloUpdate(henkiloUpdate);
        setReadOnly(true);
    }

    async function _update() {
        const newHenkiloUpdate = Object.assign({}, henkiloUpdate);
        await updateAnomusilmoitus(newHenkiloUpdate);
        if (newHenkiloUpdate.kayttajanimi !== undefined) {
            await updateKayttajatiedot(newHenkiloUpdate);
        }
        updateHenkilo(newHenkiloUpdate);
        setReadOnly(true);
    }

    async function updateHenkilo(henkiloUpdate: Henkilo) {
        return putHenkilo(henkiloUpdate)
            .unwrap()
            .then(() => fetchHenkilo(oidHenkilo)(dispatch))
            .catch((error) => {
                const errorMessages = [];
                if (error.status === 400 && error.data?.message && error.data?.message.indexOf('invalid.hetu') !== -1) {
                    errorMessages.push(L['NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE_HETU']);
                }
                if (error.status === 400 && JSON.stringify(error).includes('socialsecuritynr.already.exists')) {
                    errorMessages.push(L['NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE_HETU_KAYTOSSA']);
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
                            header: L['NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE'],
                        })
                    );
                }
            });
    }

    async function updateAnomusilmoitus(henkiloUpdate: Henkilo) {
        if (view === 'omattiedot' && omattiedot.isAdmin) {
            const initialAnomusilmoitusValue = omattiedot.anomusilmoitus;
            return putAnomusilmoitus({ oid: henkiloUpdate.oidHenkilo, anomusilmoitus: henkiloUpdate.anomusilmoitus })
                .unwrap()
                .catch(() => {
                    setHenkiloUpdate({
                        ...henkiloUpdate,
                        anomusilmoitus: initialAnomusilmoitusValue,
                    });
                });
        }
    }

    async function updateKayttajatiedot(henkiloUpdate: Henkilo) {
        return putKayttajatiedot({ oid: henkiloUpdate.oidHenkilo, username: henkiloUpdate.kayttajanimi })
            .unwrap()
            .catch((err) => {
                const errorKey = err.data?.message?.includes('username_unique')
                    ? 'NOTIFICATION_HENKILOTIEDOT_KAYTTAJANIMI_EXISTS'
                    : 'NOTIFICATION_HENKILOTIEDOT_TALLENNUS_VIRHE';
                dispatch(
                    add({
                        id: `put-kayttajatiedot-${Math.random()}`,
                        type: 'error',
                        header: L[errorKey],
                    })
                );
            });
    }

    function _updateModelField(event: React.SyntheticEvent<HTMLInputElement>) {
        const newHenkiloUpdate = { ...StaticUtils.updateFieldByDotAnnotation(henkiloUpdate, event) };
        setHenkiloUpdate(newHenkiloUpdate);
    }

    function _updateModelSelectValue(event: NamedSelectOption | NamedMultiSelectOption) {
        const newHenkiloUpdate = { ...StaticUtils.updateSelectValueByDotAnnotation(henkiloUpdate, event) };
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
        return !(henkilo.henkilo.yksilointivirheet && henkilo.henkilo.yksilointivirheet.length);
    }

    function _getYksilointivirhe() {
        const yksilointivirheet = henkilo.henkilo.yksilointivirheet;
        const virhe = yksilointivirheet[0];
        const yksilointivirheMap = {
            HETU_EI_OIKEA: 'HENKILO_YKSILOINTIVIRHE_HETU_EI_OIKEA',
            HETU_EI_VTJ: 'HENKILO_YKSILOINTIVIRHE_HETU_EI_VTJ',
            HETU_PASSIVOITU: 'HENKILO_YKSILOINTIVIRHE_HETU_PASSIVOITU',
            MUU_UUDELLEENYRITETTAVA: 'HENKILO_YKSILOINTIVIRHE_MUU_UUDELLEENYRITETTAVA',
            MUU: 'HENKILO_YKSILOINTIVIRHE_MUU',
        };
        const virheKey = yksilointivirheMap[virhe.yksilointivirheTila] || 'HENKILO_YKSILOINTIVIRHE_OLETUS';
        return virhe.uudelleenyritysAikaleima
            ? `${L[virheKey]} ${L['HENKILO_YKSILOINTIVIRHE_UUDELLEENYRITYS']} ${moment(
                  virhe.uudelleenyritysAikaleima
              ).format(PropertySingleton.getState().PVM_DATE_TIME_FORMAATTI)}`
            : L[virheKey];
    }

    let content;
    if (kayttajatiedot?.kayttajaTyyppi === 'PALVELU') {
        content = (
            <PalveluUserContent
                readOnly={readOnly}
                discardAction={_discard}
                updateAction={_update}
                updateModelAction={_updateModelField}
                updateDateAction={_updateModelField}
                henkiloUpdate={henkiloUpdate}
                edit={_edit}
                oidHenkilo={oidHenkilo}
                isValidForm={_validForm()}
            />
        );
    } else if (view === 'oppija') {
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

    const sectionLabelId = useId();
    return (
        <section aria-labelledby={sectionLabelId} className="henkiloViewUserContentWrapper">
            <h2 id={sectionLabelId}>{L['HENKILO_PERUSTIEDOT_OTSIKKO'] + _additionalInfo()}</h2>
            {content}

            <LocalNotification
                title={L['NOTIFICATION_HENKILOTIEDOT_VIRHE_OTSIKKO']}
                type={NOTIFICATIONTYPES.WARNING}
                toggle={!readOnly && !_validForm()}
            >
                <ul>{_validKutsumanimi() ? null : <li>{L['NOTIFICATION_HENKILOTIEDOT_KUTSUMANIMI_VIRHE']}</li>}</ul>
                <ul>
                    {_validKayttajatunnus() ? null : <li>{L['NOTIFICATION_HENKILOTIEDOT_KAYTTAJATUNNUS_VIRHE']}</li>}
                </ul>
            </LocalNotification>
            <LocalNotification title={L['HENKILO_YKSILOINTIVIRHE_OTSIKKO']} type={NOTIFICATIONTYPES.ERROR}>
                <ul>{_validYksilointi() ? null : <li>{_getYksilointivirhe()}</li>}</ul>
            </LocalNotification>
        </section>
    );
};
