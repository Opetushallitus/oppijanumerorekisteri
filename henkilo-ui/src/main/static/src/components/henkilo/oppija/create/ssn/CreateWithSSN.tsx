import React from 'react';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import classNames from 'classnames';
import type { RootState } from '../../../../../reducers';
import type { ExistenceCheckRequest, ExistenceCheckState } from '../../../../../reducers/existence.reducer';
import { doExistenceCheck, clearExistenceCheck } from '../../../../../actions/existence.actions';
import { Link } from 'react-router';
import Button from '../../../../common/button/Button';
import { SpinnerInButton } from '../../../../common/icons/SpinnerInButton';
import './CreateWithSSN.css';

type OwnProps = {
    goBack: () => void;
};

type StateProps = ExistenceCheckState & {
    translate: (key: string) => string;
};

type DispatchProps = {
    clear: () => void;
    check: (payload: ExistenceCheckRequest) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

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

export const CreateWithSSN: React.FC<Props> = ({ translate, goBack, clear, check, status, oid, msgKey }) => {
    React.useEffect(() => {
        clear();
    }, [clear]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<ExistenceCheckRequest>({ resolver: joiResolver(schema), mode: 'onChange' });

    const onSubmit = (data: ExistenceCheckRequest): void => check(data);

    return (
        <div className="wrapper">
            <span className="oph-h2 oph-bold">{translate('OPPIJAN_LUONTI_OTSIKKO')}</span>
            {msgKey && (
                <div
                    className={classNames('check-result', {
                        'oph-alert-success': status === 200,
                        'oph-alert-info': status === 204,
                        'oph-alert-error': status >= 400,
                    })}
                >
                    <ReactMarkdown>{translate(msgKey)}</ReactMarkdown>
                    {oid && (
                        <b>
                            <Link to={`/oppija/${oid}`}>{oid}</Link>
                        </b>
                    )}
                    {status === 204 && <Button>Nappi joka ei tee vielä mitään</Button>}
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
                            reset();
                        }}
                        className="oph-button oph-button-primary margin-left"
                        disabled={loading}
                    >
                        {translate('PERUUTA')}
                    </button>
                </div>
                <div className="oph-field">
                    <Button action={goBack}>{translate('TAKAISIN_LINKKI')}</Button>
                </div>
            </form>
        </div>
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    ...state.existenceCheck,
    translate: (key: string) => state.l10n.localisations[state.locale][key] || key,
});

const mapDispatchToProps = {
    clear: clearExistenceCheck,
    check: doExistenceCheck,
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(CreateWithSSN);
