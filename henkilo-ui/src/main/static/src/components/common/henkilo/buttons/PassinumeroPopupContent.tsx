import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import Button from '../../../common/button/Button';
import Loader from '../../../common/icons/Loader';
import { useGetPassinumerotQuery, useSetPassinumerotMutation } from '../../../../api/oppijanumerorekisteri';
import { addGlobalNotification } from '../../../../actions/notification.actions';
import './PassinumeroPopupContent.css';

type Props = {
    oid: string;
    translate: (key: string) => string;
};

const PassinumeroPopupContent = ({ oid, translate }: Props) => {
    const dispatch = useDispatch();
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
            addGlobalNotification({
                key: 'PASSINUMEROT_NETWORK_ERROR',
                type: 'error',
                title: translate('PASSINUMEROT_NETWORK_ERROR'),
            })(dispatch);
        }
    }, [readError, writeError, dispatch, translate]);

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
                    placeholder={translate('LISAA_PASSINUMERO_PLACEHOLDER')}
                    {...register('passinumero', { required: true })}
                />
                <Button action={handleSubmit(onSubmit)} disabled={!isValid || readError || writeError}>
                    {translate('LISAA_PASSINUMERO')}
                </Button>
            </form>
        </>
    );
};

export default PassinumeroPopupContent;
