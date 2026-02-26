import React, { useState } from 'react';
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
import { isValidKutsumanimi } from '../../../../../validation/KutsumanimiValidator';

import './DetailsForm.css';

type OwnProps = {
    goBack: () => void;
};

const isValid = (form: CreateHenkiloRequest) => {
    return (
        isHetu(form) &&
        !!form.etunimet.trim() &&
        !!form.sukunimi.trim() &&
        isValidKutsumanimi(form.etunimet, form.kutsumanimi)
    );
};

const isHetu = (form: CreateHenkiloRequest) => {
    return form.hetu?.match(/^\d{6}[ABCDEFYXWVU+-]\d{3}[0123456789ABCDEFHJKLMNPRSTUVWXY]$/);
};

export const statusToMessage: Record<number, string> = {
    200: 'EXISTENCE_CHECK_ONR',
    204: 'EXISTENCE_CHECK_VTJ',
    400: 'EXISTENCE_CHECK_BAD_REQUEST',
    404: 'EXISTENCE_CHECK_NOT_FOUND',
    409: 'EXISTENCE_CHECK_CONFLICT',
};

const getMessageClass = (existingStatus?: number) => {
    if (existingStatus === 200) {
        return 'check-result oph-alert-success';
    } else if (existingStatus === 204) {
        return 'check-result oph-alert-info';
    } else if (existingStatus && existingStatus >= 400) {
        return 'check-result oph-alert-error';
    }
    return 'check-result';
};

const initialForm = {
    hetu: '',
    etunimet: '',
    kutsumanimi: '',
    sukunimi: '',
};

export const OppijaCreateSsnContainer = ({ goBack }: OwnProps) => {
    const { L } = useLocalisations();
    const [henkiloExists, { isLoading }] = useHenkiloExistsMutation({});
    const [createHenkilo] = useCreateHenkiloMutation();
    const [form, setForm] = useState<CreateHenkiloRequest>(initialForm);
    const [existingOid, setExistingOid] = useState<string>();
    const [existingStatus, setExistingStatus] = useState<number>();
    const [existingMessage, setExistingMessage] = useState<string>();
    const [createOid, setCreateOid] = useState<string>();
    const [createError, setCreateError] = useState(false);

    const handleExists = async () => {
        await henkiloExists(form)
            .unwrap()
            .then(({ oid, status }) => {
                setExistingOid(oid);
                setExistingStatus(status);
                if (status) {
                    setExistingMessage(statusToMessage[status]);
                }
            })
            .catch(({ status }) => {
                setExistingStatus(status);
                setExistingMessage(statusToMessage[status]);
            });
    };

    const handleCreate = async () => {
        await createHenkilo(form)
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
        setForm(initialForm);
    };

    return (
        <div className="mainContent wrapper">
            <span className="oph-h2 oph-bold">{L('OPPIJAN_LUONTI_OTSIKKO')}</span>
            <span className="float-right">
                <CloseButton closeAction={goBack} />
            </span>
            <div className="oph-field">
                {createOid && (
                    <>
                        <div className="create-result oph-alert-success">
                            <ReactMarkdown>{L('CREATE_PERSON_SUCCESS') ?? ''}</ReactMarkdown>
                            <CopyToClipboard text={createOid} />
                        </div>
                        <Button action={resetState}>{L('HENKILO_LUOYHTEYSTIETO')}</Button>
                    </>
                )}
                {createError && (
                    <div className="create-result oph-alert-error">
                        <ReactMarkdown>{L('CREATE_PERSON_FAILURE') ?? ''}</ReactMarkdown>
                    </div>
                )}
                {existingMessage && (
                    <div className={getMessageClass(existingStatus)}>
                        <ReactMarkdown>{L(existingMessage) ?? ''}</ReactMarkdown>
                        {existingStatus === 200 && <CopyToClipboard text={existingOid ?? ''} />}
                        {existingStatus === 204 && <Button action={handleCreate}>{L('HENKILO_LUOYHTEYSTIETO')}</Button>}
                    </div>
                )}
                {!createOid && !createError && (
                    <form>
                        <div className="oph-field oph-field-is-required">
                            <label className="oph-label">{L('HENKILO_HETU')}</label>
                            <input
                                className={`oph-input ${!isHetu(form) ? 'oph-input-has-error' : ''}`}
                                placeholder={L('HENKILO_HETU')}
                                type="text"
                                onChange={(e) => setForm({ ...form, hetu: e.target.value })}
                            />
                            {!isHetu(form) && (
                                <div className="oph-field-text oph-error">{L('LOMAKE_KENTTA_SISALTAA_VIRHEITA')}</div>
                            )}
                        </div>
                        <div className="oph-field oph-field-is-required">
                            <label className="oph-label">{L('HENKILO_ETUNIMET')}</label>
                            <input
                                className={`oph-input ${!form.etunimet.trim() ? 'oph-input-has-error' : ''}`}
                                placeholder={L('HENKILO_ETUNIMET')}
                                type="text"
                                onChange={(e) => setForm({ ...form, etunimet: e.target.value })}
                            />
                            {!form.etunimet.trim() && (
                                <div className="oph-field-text oph-error">{L('LOMAKE_PAKOLLINEN_TIETO')}</div>
                            )}
                        </div>
                        <div className="oph-field oph-field-is-required">
                            <label className="oph-label">{L('HENKILO_KUTSUMANIMI')}</label>
                            <input
                                className={`oph-input ${!isValidKutsumanimi(form.etunimet, form.kutsumanimi) ? 'oph-input-has-error' : ''}`}
                                placeholder={L('HENKILO_KUTSUMANIMI')}
                                type="text"
                                onChange={(e) => setForm({ ...form, kutsumanimi: e.target.value })}
                            />
                            {!isValidKutsumanimi(form.etunimet, form.kutsumanimi) && (
                                <div className="oph-field-text oph-error">{L('HENKILO_KUTSUMANIMI_VALIDOINTI')}</div>
                            )}
                        </div>
                        <div className="oph-field oph-field-is-required">
                            <label className="oph-label">{L('HENKILO_SUKUNIMI')}</label>
                            <input
                                className={`oph-input ${!form.sukunimi.trim() ? 'oph-input-has-error' : ''}`}
                                placeholder={L('HENKILO_SUKUNIMI')}
                                type="text"
                                onChange={(e) => setForm({ ...form, sukunimi: e.target.value })}
                            />
                            {!form.sukunimi.trim() && (
                                <div className="oph-field-text oph-error">{L('LOMAKE_PAKOLLINEN_TIETO')}</div>
                            )}
                        </div>
                        <div className="oph-field">
                            <Button action={() => handleExists()} disabled={!isValid(form) || isLoading}>
                                <SpinnerInButton show={isLoading} />
                                {L('KUTSUTUT_VIRKAILIJAT_HAKU_HENKILO')}
                            </Button>
                            <Button className="margin-left" action={() => resetState()} disabled={isLoading}>
                                {L('TYHJENNA')}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default OppijaCreateSsnContainer;
