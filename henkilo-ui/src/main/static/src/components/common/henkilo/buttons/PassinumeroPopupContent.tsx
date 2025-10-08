import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../../common/button/Button';
import Loader from '../../../common/icons/Loader';
import { useGetPassinumerotQuery, useSetPassinumerotMutation } from '../../../../api/oppijanumerorekisteri';
import './PassinumeroPopupContent.css';
import { useAppDispatch } from '../../../../store';
import { useLocalisations } from '../../../../selectors';
import { add } from '../../../../slices/toastSlice';

type Props = {
    oid: string;
};

const PassinumeroPopupContent = ({ oid }: Props) => {
    const { L } = useLocalisations();
    const dispatch = useAppDispatch();
    const {
        data: passinumerot = [],
        isLoading: isReading,
        isError: readError,
    } = useGetPassinumerotQuery(oid, {
        refetchOnMountOrArgChange: true,
    });
    const [setPassinumerot, { isLoading: isUpdating, isError: writeError }] = useSetPassinumerotMutation();

    useEffect(() => {
        if (readError || writeError) {
            dispatch(
                add({
                    id: `PASSINUMEROT_NETWORK_ERROR-${Math.random()}`,
                    type: 'error',
                    header: L['PASSINUMEROT_NETWORK_ERROR'],
                })
            );
        }
    }, [readError, writeError, dispatch]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { isValid },
    } = useForm<{ passinumero: string }>({ mode: 'onChange' });

    const onSubmit = ({ passinumero }: { passinumero: string }): void => {
        setPassinumerot({ oid, passinumerot: [...passinumerot, passinumero] });
        reset();
    };

    const remove = (removed: string) =>
        setPassinumerot({ oid, passinumerot: [...passinumerot].filter((passinumero) => passinumero !== removed) });

    return isReading || isUpdating ? (
        <Loader />
    ) : (
        <>
            <ul>
                {passinumerot.map((passinumero) => (
                    <li key={passinumero}>
                        <i className="fa fa-trash passinumero-trash" onClick={() => remove(passinumero)}></i>
                        {passinumero}
                    </li>
                ))}
            </ul>
            <form className="passinumero-form">
                <input
                    type="text"
                    className="oph-input passinumero-input"
                    aria-required="true"
                    placeholder={L['LISAA_PASSINUMERO_PLACEHOLDER']}
                    {...register('passinumero', { required: true })}
                />
                <Button action={handleSubmit(onSubmit)} disabled={!isValid || readError || writeError}>
                    {L['LISAA_PASSINUMERO']}
                </Button>
            </form>
        </>
    );
};

export default PassinumeroPopupContent;
