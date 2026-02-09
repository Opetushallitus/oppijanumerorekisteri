import React, { useState } from 'react';

import { useGetPassinumerotQuery, useSetPassinumerotMutation } from '../../../../api/oppijanumerorekisteri';
import { useAppDispatch } from '../../../../store';
import { useLocalisations } from '../../../../selectors';
import { add } from '../../../../slices/toastSlice';
import { OphDsInput } from '../../../design-system/OphDsInput';

type Props = {
    oid: string;
};

const PassinumeroPopupContent = ({ oid }: Props) => {
    const { L } = useLocalisations();
    const dispatch = useAppDispatch();
    const { data: passinumerot = [] } = useGetPassinumerotQuery(oid, {
        refetchOnMountOrArgChange: true,
    });
    const [newPassinumero, setNewPassinumero] = useState('');
    const [setPassinumerot] = useSetPassinumerotMutation();

    const onSubmit = async (): Promise<void> => {
        await setPassinumerot({ oid, passinumerot: [...passinumerot, newPassinumero] })
            .unwrap()
            .then(() => setNewPassinumero(''))
            .catch(() => {
                dispatch(
                    add({
                        id: `TAPAHTUI_ODOTTAMATON_VIRHE-${Math.random()}`,
                        type: 'error',
                        header: L['TAPAHTUI_ODOTTAMATON_VIRHE'],
                    })
                );
            });
    };

    const remove = async (removed: string) =>
        await setPassinumerot({ oid, passinumerot: [...passinumerot].filter((passinumero) => passinumero !== removed) })
            .unwrap()
            .catch(() => {
                dispatch(
                    add({
                        id: `TAPAHTUI_ODOTTAMATON_VIRHE-${Math.random()}`,
                        type: 'error',
                        header: L['TAPAHTUI_ODOTTAMATON_VIRHE'],
                    })
                );
            });

    return (
        <div className="passinumero-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {passinumerot.map((passinumero) => (
                    <div key={passinumero} style={{ display: 'flex', alignContent: 'center', gap: '16px' }}>
                        <button
                            className="oph-ds-button oph-ds-button-bordered oph-ds-icon-button oph-ds-icon-button-delete"
                            onClick={() => remove(passinumero)}
                        />
                        {passinumero}
                    </div>
                ))}
            </div>
            <OphDsInput
                id="passinumero"
                aria-required="true"
                label={L['LISAA_PASSINUMERO_PLACEHOLDER']!}
                defaultValue={newPassinumero}
                onChange={setNewPassinumero}
            />
            <div>
                <button className="oph-ds-button" onClick={() => onSubmit()} disabled={!newPassinumero}>
                    {L['LISAA_PASSINUMERO']}
                </button>
            </div>
        </div>
    );
};

export default PassinumeroPopupContent;
