import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import classNames from 'classnames';
import type { ExistenceCheckRequest, ExistenceCheckState } from '../../../../../reducers/existence.reducer';
import { Link } from 'react-router';
import Button from '../../../../common/button/Button';
import { SpinnerInButton } from '../../../../common/icons/SpinnerInButton';
import './ExistenceCheck.css';

type Props = ExistenceCheckState & {
    translate: (key: string) => string;
    clear: () => void;
    check: (payload: ExistenceCheckRequest) => void;
    cache: (payload: ExistenceCheckRequest) => void;
    create: () => void;
};

export const schema = Joi.object({
    hetu: Joi.string()
        .trim(true)
        .regex(/^\d{6}[A+-]\d{3}[0-9A-z]$/)
        .required(),
    etunimet: Joi.string().trim(true).required(),
    kutsumanimi: Joi.string()
        .trim(true)
        .custom((nickName, { state }) => {
            if (state.ancestors[0]['etunimet'].includes(nickName)) return nickName;
            throw new Error();
        })
        .required(),
    sukunimi: Joi.string().trim(true).required(),
});

type FormField = {
    name: keyof ExistenceCheckRequest;
    localizationKey: string;
};

const formFields: FormField[] = [
    {
        name: 'hetu',
        localizationKey: 'HENKILO_HETU',
    },
    {
        name: 'etunimet',
        localizationKey: 'HENKILO_ETUNIMET',
    },
    {
        name: 'kutsumanimi',
        localizationKey: 'HENKILO_KUTSUMANIMI',
    },
    {
        name: 'sukunimi',
        localizationKey: 'HENKILO_SUKUNIMI',
    },
];

const ExistenceCheck: React.FC<Props> = ({ translate, clear, check, cache, create, loading, status, oid, msgKey }) => {
    React.useEffect(() => {
        clear();
        cache(undefined);
    }, [clear, cache]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<ExistenceCheckRequest>({ resolver: joiResolver(schema), mode: 'onChange' });

    const onSubmit = (data: ExistenceCheckRequest): void => {
        cache(data);
        check(data);
    };

    return (
        <>
            {msgKey && (
                <div
                    className={classNames('check-result', {
                        'oph-alert-success': status === 200,
                        'oph-alert-info': status === 204,
                        'oph-alert-error': status >= 400,
                    })}
                >
                    <ReactMarkdown>{translate(msgKey)}</ReactMarkdown>
                    {status === 200 && (
                        <b>
                            <Link to={`/oppija/${oid}`}>{oid}</Link>
                        </b>
                    )}
                    {status === 204 && <Button action={create}>{translate('HENKILO_LUOYHTEYSTIETO')}</Button>}
                </div>
            )}
            <form>
                {formFields.map((field) => (
                    <div className="oph-field oph-field-is-required">
                        <label className="oph-label">{translate(field.localizationKey)}</label>
                        <input
                            className={classNames('oph-input', {
                                'oph-input-has-error': !!errors[field.name],
                            })}
                            placeholder={translate(field.localizationKey)}
                            type="text"
                            {...register(field.name)}
                            onFocus={clear}
                        />
                    </div>
                ))}
                <div className="oph-field">
                    <button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        className="oph-button oph-button-primary"
                        disabled={!isValid || loading}
                    >
                        <SpinnerInButton show={loading} />
                        {translate('KUTSUTUT_VIRKAILIJAT_HAKU_HENKILO')}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            clear();
                            cache(undefined);
                            reset();
                        }}
                        className="oph-button oph-button-primary margin-left"
                        disabled={loading}
                    >
                        {translate('PERUUTA')}
                    </button>
                </div>
            </form>
        </>
    );
};

export default ExistenceCheck;
