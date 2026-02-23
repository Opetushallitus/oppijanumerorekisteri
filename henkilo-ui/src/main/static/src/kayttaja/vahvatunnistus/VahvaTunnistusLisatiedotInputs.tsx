import React from 'react';

import { LocalNotification } from '../../components/common/Notification/LocalNotification';
import { Localisations } from '../../types/localisation.type';
import Salasana from '../../components/common/henkilo/labelvalues/Salasana';

export type Values = {
    password: string;
    passwordAgain: string;
    tyosahkopostiosoite: string;
};
export type Field = {
    visible: boolean;
    disabled: boolean;
    required: boolean;
};
export type Metadata = {
    password: Field;
    tyosahkopostiosoite: Field;
};
export type Error = {
    name: string;
    text?: string;
};
export type Errors = Error[];
export type Form = {
    values: Values;
    metadata: Metadata;
    errors: Errors;
    submitted: boolean;
};

type Props = {
    L: Localisations;
    form: Form;
    onChange: (name: string, value: string) => void;
};

const VahvaTunnistusLisatiedotInputs = (props: Props) => {
    const hasError = (name: string): boolean => {
        return props.form.submitted && props.form.errors.some((error) => error.name === name);
    };

    const onInputChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
        props.onChange(event.currentTarget.name, event.currentTarget.value);
    };

    return (
        <div>
            {props.form.metadata.password.visible && (
                <div className="oph-field oph-field-is-required">
                    <label className="oph-label" htmlFor="password">
                        {props.L['UUDELLEENREKISTEROINTI_UUSI_SALASANA']}
                    </label>
                    <Salasana
                        disabled={props.form.metadata.password.disabled}
                        isError={hasError('password')}
                        updateModelFieldAction={onInputChange}
                    />
                    <LocalNotification
                        type="error"
                        title={props.L['LOMAKE_KENTTA_SISALTAA_VIRHEITA']}
                        toggle={hasError('password')}
                    >
                        <ul>
                            {props.form.errors
                                .filter((error) => error.name === 'password')
                                .map((error, index) => (
                                    <li key={index}>{error.text}</li>
                                ))}
                        </ul>
                    </LocalNotification>
                </div>
            )}
            {props.form.metadata.tyosahkopostiosoite.visible && (
                <div className="oph-field oph-field-is-required">
                    <label className="oph-label" htmlFor="tyosahkopostiosoite">
                        {props.L['UUDELLEENREKISTEROINTI_SAHKOPOSTIOSOITE']}
                    </label>
                    <input
                        type="email"
                        name="tyosahkopostiosoite"
                        value={props.form.values.tyosahkopostiosoite}
                        onChange={onInputChange}
                        className={`oph-input ${hasError('tyosahkopostiosoite') ? 'oph-input-has-error' : ''}`}
                        disabled={props.form.metadata.tyosahkopostiosoite.disabled}
                    />
                    <LocalNotification
                        type="error"
                        title={props.L['LOMAKE_KENTTA_SISALTAA_VIRHEITA']}
                        toggle={hasError('tyosahkopostiosoite')}
                    >
                        <ul>
                            {props.form.errors
                                .filter((error) => error.name === 'tyosahkopostiosoite')
                                .map((error, index) => (
                                    <li key={index}>{error.text}</li>
                                ))}
                        </ul>
                    </LocalNotification>
                </div>
            )}
        </div>
    );
};

export default VahvaTunnistusLisatiedotInputs;
