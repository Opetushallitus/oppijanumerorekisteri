import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../../common/button/Button';
import Loader from '../../../common/icons/Loader';
import './PassinumeroPopupContent.css';

type Props = {
    oid: string;
    loading: boolean;
    passinumerot: string[];
    translate: (key: string) => string;
    readPassinumerot: (oid: string) => void;
    writePassinumerot: (oid: string, passinumerot: string[]) => void;
};

const PassinumeroPopupContent = ({
    oid,
    passinumerot,
    readPassinumerot,
    writePassinumerot,
    loading,
    translate,
}: Props) => {
    useEffect(() => {
        readPassinumerot(oid);
    }, [readPassinumerot, oid]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { isValid },
    } = useForm<{ passinumero: string }>({ mode: 'onChange' });

    const onSubmit = ({ passinumero }: { passinumero: string }): void => {
        writePassinumerot(oid, [...passinumerot, passinumero]);
        reset();
    };

    const remove = (removed: string) =>
        writePassinumerot(
            oid,
            [...passinumerot].filter((passinumero) => passinumero !== removed)
        );

    return loading ? (
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
                <Button action={handleSubmit(onSubmit)} disabled={!isValid}>
                    {translate('LISAA_PASSINUMERO')}
                </Button>
            </form>
        </>
    );
};

export default PassinumeroPopupContent;
