import React, { useState } from 'react';

import Button from '../common/button/Button';
import { KutsuOrganisaatio } from '../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import { KutsuBasicInfo } from '../../types/KutsuBasicInfo.types';
import OphModal from '../common/modal/OphModal';
import { useLocalisations } from '../../selectors';
import { usePutKutsuMutation } from '../../api/kayttooikeus';
import { useAppDispatch } from '../../store';
import { add } from '../../slices/toastSlice';
import { localizeTextGroup } from '../../utilities/localisation.util';

type Props = {
    addedOrgs: readonly KutsuOrganisaatio[];
    modalCloseFn: (arg0: React.SyntheticEvent<EventTarget>) => void;
    basicInfo: KutsuBasicInfo;
    resetFormValues: () => void;
};

export const KutsuConfirmation = (props: Props) => {
    const dispatch = useAppDispatch();
    const { L, locale } = useLocalisations();
    const [sent, setSent] = useState(false);
    const [putKutsu, { isLoading }] = usePutKutsuMutation();

    function onClose(e: React.SyntheticEvent<HTMLElement>) {
        props.resetFormValues();
        props.modalCloseFn(e);
        setSent(false);
    }

    async function sendInvitation(e: React.SyntheticEvent<HTMLElement>) {
        e.preventDefault();

        const sahkoposti = props.basicInfo.email && props.basicInfo.email.trim();
        const payload = {
            etunimi: props.basicInfo.etunimi,
            sukunimi: props.basicInfo.sukunimi,
            sahkoposti,
            asiointikieli: props.basicInfo.languageCode,
            saate: props.basicInfo.saate ? props.basicInfo.saate : undefined,
            organisaatiot: props.addedOrgs.map((addedOrg) => ({
                organisaatioOid: addedOrg.organisation.oid,
                voimassaLoppuPvm: addedOrg.voimassaLoppuPvm!,
                kayttoOikeusRyhmat: addedOrg.selectedPermissions.map((selectedPermission) => ({
                    id: selectedPermission.ryhmaId,
                })),
            })),
        };

        await putKutsu(payload)
            .unwrap()
            .then(() => {
                dispatch(
                    add({
                        id: `kutsu-ok-${Math.random()}`,
                        type: 'ok',
                        header: L('VIRKAILIJAN_LISAYS_LAHETETTY'),
                    })
                );
                setSent(true);
            })
            .catch(() => {
                dispatch(
                    add({
                        id: `kutsu-failed-${Math.random()}`,
                        type: 'error',
                        header: L('KUTSU_LUONTI_EPAONNISTUI_TUNTEMATON_VIRHE'),
                    })
                );
            });
    }
    return (
        <OphModal onClose={props.modalCloseFn} onOverlayClick={props.modalCloseFn}>
            <h2>{L('VIRKAILIJAN_LISAYS_ESIKATSELU_OTSIKKO')}</h2>
            <p>
                {L('VIRKAILIJAN_LISAYS_ESIKATSELU_TEKSTI')} {props.basicInfo.email}
            </p>
            <h3>{L('VIRKAILIJAN_LISAYS_ESIKATSELU_ALAOTSIKKO')}</h3>
            {props.addedOrgs.map((org) => (
                <div key={org.organisation.oid}>
                    <span className="oph-h3 oph-strong">{org.organisation.name}</span>
                    {org.selectedPermissions.map((permission) => (
                        <div key={permission.ryhmaId}>
                            <span className="oph-h4 oph-strong">
                                {localizeTextGroup(permission.ryhmaNames?.texts, locale)}
                            </span>
                        </div>
                    ))}
                </div>
            ))}
            <div className="row">
                {sent ? (
                    <Button action={onClose}>{L('VIRKAILIJAN_LISAYS_LAHETETTY')}</Button>
                ) : (
                    <Button action={sendInvitation} loading={isLoading}>
                        {L('VIRKAILIJAN_LISAYS_TALLENNA')}
                    </Button>
                )}
            </div>
        </OphModal>
    );
};
