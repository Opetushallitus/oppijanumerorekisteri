import React from 'react';
import { connect } from 'react-redux';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import classNames from 'classnames';
import type { RootState } from '../../../../../reducers';
import type { ExistenceCheckRequest, ExistenceCheckReponse } from '../../../../../reducers/existence.reducer';
import { doExistenceCheck, clearExistenceCheck } from '../../../../../actions/existence.actions';
import Button from '../../../../common/button/Button';

type OwnProps = {
    goBack: () => void;
};

type StateProps = {
    translate: (key: string) => string;
    loading: boolean;
    status?: number;
    data?: ExistenceCheckReponse;
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

export const CreateWithSSN: React.FC<Props> = ({ translate, goBack, clear, check, status }) => {
    React.useEffect(() => {
        clear();
    }, [clear]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ExistenceCheckRequest>({ resolver: joiResolver(schema) });

    const onSubmit = (data: ExistenceCheckRequest): void => check(data);

    return (
        <div className="wrapper">
            <span className="oph-h2 oph-bold">{translate('OPPIJAN_LUONTI_OTSIKKO')}</span>
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
                        disabled={!!Object.keys(errors).length}
                    >
                        {translate('TALLENNA_LINKKI')}
                    </button>
                </div>
                {status && <div>{status}</div>}
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
    data: state.existenceCheck.data,
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
