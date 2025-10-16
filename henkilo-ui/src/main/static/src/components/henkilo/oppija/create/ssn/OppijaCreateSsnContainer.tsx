import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import classNames from 'classnames';
import ReactMarkdown from 'react-markdown';

import CloseButton from '../../../../common/button/CloseButton';
import { useLocalisations } from '../../../../../selectors';
import Button from '../../../../common/button/Button';
import { SpinnerInButton } from '../../../../common/icons/SpinnerInButton';
import {
    CreateHenkiloRequest,
    useCreateHenkiloMutation,
    useHenkiloExistsMutation,
} from '../../../../../api/oppijanumerorekisteri';
import CopyToClipboard from './CopyToClipboard';

import './DetailsForm.css';

type OwnProps = {
    goBack: () => void;
};

export const schema = Joi.object({
    hetu: Joi.string()
        .trim(true)
        .regex(/^\d{6}[ABCDEFYXWVU+-]\d{3}[0123456789ABCDEFHJKLMNPRSTUVWXY]$/)
        .required(),
    etunimet: Joi.string().trim(true).required(),
    kutsumanimi: Joi.string()
        .trim(true)
        .custom((kutsumanimi, { state }) => {
            const firstnames = state.ancestors[0]['etunimet']
                .split(/\s/)
                .flatMap((s: string) => [s, ...s.split('-')])
                .map((s: string) => s.toLowerCase())
                .filter((value: string, index: number, arr: string[]) => arr.indexOf(value) === index);
            if (firstnames.includes(kutsumanimi.toLowerCase())) return kutsumanimi;
            throw new Error();
        })
        .required(),
    sukunimi: Joi.string().trim(true).required(),
});

type FormField = {
    name: keyof CreateHenkiloRequest;
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

const formFieldErrors: Record<string, string> = {
    'string.empty': 'LOMAKE_PAKOLLINEN_TIETO',
    'any.custom': 'HENKILO_KUTSUMANIMI_VALIDOINTI',
};

export const statusToMessage: Record<number, string> = {
    200: 'EXISTENCE_CHECK_ONR',
    204: 'EXISTENCE_CHECK_VTJ',
    400: 'EXISTENCE_CHECK_BAD_REQUEST',
    404: 'EXISTENCE_CHECK_NOT_FOUND',
    409: 'EXISTENCE_CHECK_CONFLICT',
};

const resolveErrorKey = (key: string): string => formFieldErrors[key] || 'LOMAKE_KENTTA_SISALTAA_VIRHEITA';

export const OppijaCreateSsnContainer = ({ goBack }: OwnProps) => {
    const { L } = useLocalisations();
    const [henkiloExists, { isLoading }] = useHenkiloExistsMutation({});
    const [createHenkilo] = useCreateHenkiloMutation();

    const [existingOid, setExistingOid] = useState<string>();
    const [existingStatus, setExistingStatus] = useState<number>();
    const [existingMessage, setExistingMessage] = useState<string>();
    const [createOid, setCreateOid] = useState<string>();
    const [createError, setCreateError] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
        getValues,
    } = useForm<CreateHenkiloRequest>({ resolver: joiResolver(schema), mode: 'onChange' });

    const handleExists = async (data: CreateHenkiloRequest) => {
        await henkiloExists(data)
            .unwrap()
            .then(({ oid, status }) => {
                setExistingOid(oid);
                setExistingStatus(status);
                setExistingMessage(statusToMessage[status]);
            })
            .catch(({ status }) => {
                setExistingStatus(status);
                setExistingMessage(statusToMessage[status]);
            });
    };

    const handleCreate = async () => {
        await createHenkilo(getValues())
            .unwrap()
            .then(setCreateOid)
            .catch(() => setCreateError(true));
    };

    const resetState = () => {
        setExistingOid(undefined);
        setExistingMessage(undefined);
        setExistingStatus(undefined);
        setCreateOid(undefined);
        setCreateError(false);
        reset();
    };

    return (
        <div className="mainContent wrapper">
            <span className="oph-h2 oph-bold">{L['OPPIJAN_LUONTI_OTSIKKO']}</span>
            <span className="float-right">
                <CloseButton closeAction={goBack} />
            </span>
            <div className="oph-field">
                {createOid && (
                    <>
                        <div className="create-result oph-alert-success">
                            <ReactMarkdown>{L['CREATE_PERSON_SUCCESS']}</ReactMarkdown>
                            <CopyToClipboard text={createOid} L={L} />
                        </div>
                        <Button action={resetState}>{L['HENKILO_LUOYHTEYSTIETO']}</Button>
                    </>
                )}
                {createError && (
                    <div className="create-result oph-alert-error">
                        <ReactMarkdown>{L['CREATE_PERSON_FAILURE']}</ReactMarkdown>
                    </div>
                )}
                {existingMessage && (
                    <div
                        className={classNames('check-result', {
                            'oph-alert-success': existingStatus === 200,
                            'oph-alert-info': existingStatus === 204,
                            'oph-alert-error': existingStatus >= 400,
                        })}
                    >
                        <ReactMarkdown>{L[existingMessage]}</ReactMarkdown>
                        {existingStatus === 200 && <CopyToClipboard text={existingOid} L={L} />}
                        {existingStatus === 204 && <Button action={handleCreate}>{L['HENKILO_LUOYHTEYSTIETO']}</Button>}
                    </div>
                )}
                {!createOid && !createError && (
                    <form>
                        {formFields.map((field) => (
                            <div className="oph-field oph-field-is-required" key={field.name}>
                                <label className="oph-label">{L[field.localizationKey]}</label>
                                <input
                                    className={classNames('oph-input', {
                                        'oph-input-has-error': !!errors[field.name],
                                    })}
                                    placeholder={L[field.localizationKey]}
                                    type="text"
                                    {...register(field.name)}
                                />
                                {!!errors[field.name] && (
                                    <div className="oph-field-text oph-error">
                                        {L[resolveErrorKey(errors[field.name].type)]}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="oph-field">
                            <Button action={handleSubmit(handleExists)} disabled={!isValid || isLoading}>
                                <SpinnerInButton show={isLoading} />
                                {L['KUTSUTUT_VIRKAILIJAT_HAKU_HENKILO']}
                            </Button>
                            <Button className="margin-left" action={() => resetState()} disabled={isLoading}>
                                {L['TYHJENNA']}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default OppijaCreateSsnContainer;
