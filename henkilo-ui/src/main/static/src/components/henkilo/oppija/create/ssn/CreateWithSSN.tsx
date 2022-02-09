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
    ssn: Joi.string()
        .trim(true)
        .regex(/^\d{6}[A+-]\d{3}[0-9A-z]$/)
        .required(),
    firstName: Joi.string().trim(true).required(),
    nickName: Joi.string()
        .trim(true)
        .custom((nickName, { state }) => {
            if (state.ancestors[0]['firstName'].includes(nickName)) return nickName;
            throw new Error();
        })
        .required(),
    lastName: Joi.string().trim(true).required(),
});

type FormField = {
    name: keyof ExistenceCheckRequest;
    localizationKey: string;
};

const formFields: FormField[] = [
    {
        name: 'ssn',
        localizationKey: 'HENKILO_HETU',
    },
    {
        name: 'firstName',
        localizationKey: 'HENKILO_ETUNIMET',
    },
    {
        name: 'nickName',
        localizationKey: 'HENKILO_KUTSUMANIMI',
    },
    {
        name: 'lastName',
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
                        {translate('KUTSUTUT_VIRKAILIJAT_HAKU_HENKILO')}
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
    translate: (key: string) => state.l10n.localisations[state.locale][key] || key,
    loading: state.existenceCheck.loading,
    oid: state.existenceCheck.oid,
    msgKey: state.existenceCheck.msgKey,
    status: state.existenceCheck.status,
});

const mapDispatchToProps = {
    clear: clearExistenceCheck,
    check: doExistenceCheck,
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(CreateWithSSN);
