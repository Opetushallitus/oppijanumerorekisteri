import React from 'react';
import { connect } from 'react-redux';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import classNames from 'classnames';
import type { Localisations } from '../../../../../types/localisation.type';
import type { RootState } from '../../../../../reducers';
import Button from '../../../../common/button/Button';

type OwnProps = {
    goBack: () => void;
};

type StateProps = {
    L: Localisations;
};

type Props = OwnProps & StateProps;

type Form = {
    ssn: string;
    firstName: string;
    nickName: string;
    lastName: string;
};

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
    name: keyof Form;
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

export const CreateWithSSN: React.FC<Props> = ({ L, goBack }) => {
    const translate = (key: string): string => L[key] || key;
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Form>({ resolver: joiResolver(schema) });
    const onSubmit = (data: Form): void => console.log(data);
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
                <div className="oph-field">
                    <Button action={goBack}>{translate('TAKAISIN_LINKKI')}</Button>
                </div>
            </form>
        </div>
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, {}, OwnProps, RootState>(mapStateToProps)(CreateWithSSN);
