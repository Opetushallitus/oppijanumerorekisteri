import React, { useState } from 'react';
import { addYears, format } from 'date-fns';

import { KutsuOrganisaatio } from '../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import { KutsuBasicInfo } from '../../types/KutsuBasicInfo.types';
import OphModal from '../common/modal/OphModal';
import { useLocalisations } from '../../selectors';
import { usePutKutsuMutation } from '../../api/kayttooikeus';
import { useAppDispatch } from '../../store';
import { add } from '../../slices/toastSlice';
import { localizeTextGroup } from '../../utilities/localisation.util';
import { OphDsSpinner } from '../design-system/OphDsSpinner';

type Props = {
    addedOrgs: readonly KutsuOrganisaatio[];
    modalCloseFn: (arg0: React.SyntheticEvent<EventTarget>) => void;
    basicInfo: KutsuBasicInfo;
    resetFormValues: () => void;
};

export const KutsuminenConfirmation = ({ addedOrgs, basicInfo, modalCloseFn, resetFormValues }: Props) => {
    const dispatch = useAppDispatch();
    const { L, locale } = useLocalisations();
    const [sent, setSent] = useState(false);
    const [putKutsu, { isLoading }] = usePutKutsuMutation();

    function onClose(e: React.SyntheticEvent<HTMLElement>) {
        resetFormValues();
        modalCloseFn(e);
        setSent(false);
    }

    async function sendInvitation() {
        const payload = {
            etunimi: basicInfo.etunimi,
            sukunimi: basicInfo.sukunimi,
            sahkoposti: basicInfo.email && basicInfo.email.trim(),
            asiointikieli: basicInfo.languageCode,
            saate: basicInfo.saate || undefined,
            organisaatiot: addedOrgs.map((addedOrg) => ({
                organisaatioOid: addedOrg.organisation.oid,
                voimassaLoppuPvm: addedOrg.voimassaLoppuPvm ?? format(addYears(new Date(), 1), 'yyyy-MM-dd'),
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
        <OphModal onClose={modalCloseFn} onOverlayClick={modalCloseFn}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2>{L('VIRKAILIJAN_LISAYS_ESIKATSELU_OTSIKKO')}</h2>
                <p>
                    {L('VIRKAILIJAN_LISAYS_ESIKATSELU_TEKSTI')} {basicInfo.email}
                </p>
                <h3>{L('VIRKAILIJAN_LISAYS_ESIKATSELU_ALAOTSIKKO')}</h3>
                {addedOrgs.map((org) => (
                    <div key={org.organisation.oid}>
                        <h4>{org.organisation.name}</h4>
                        {org.selectedPermissions.map((permission) => (
                            <div key={permission.ryhmaId}>
                                {localizeTextGroup(permission.ryhmaNames?.texts, locale)}
                            </div>
                        ))}
                    </div>
                ))}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {sent ? (
                        <button className="oph-ds-button" onClick={onClose}>
                            {L('VIRKAILIJAN_LISAYS_LAHETETTY')}
                        </button>
                    ) : (
                        <>
                            <button className="oph-ds-button" onClick={sendInvitation}>
                                {L('VIRKAILIJAN_LISAYS_TALLENNA')}
                            </button>
                            {isLoading && <OphDsSpinner />}
                        </>
                    )}
                </div>
            </div>
        </OphModal>
    );
};
