import React, { useState } from 'react';
import { Params, useNavigate, useParams } from 'react-router';

import VahvaTunnistusLisatiedotInputs, { Values, Metadata, Errors } from './VahvaTunnistusLisatiedotInputs';
import { Localisations } from '../../types/localisation.type';
import { isValidPassword } from '../../validation/PasswordValidator';
import { toSupportedLocale, useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';
import { usePostUudelleenRekisterointiMutation } from '../../api/kayttooikeus';

import './VahvaTunnistusLisatiedotPage.css';
import { isApiError } from '../../api/common';

const getInitialValues = (): Values => ({
    password: '',
    passwordAgain: '',
    tyosahkopostiosoite: '',
});

const getInitialMetadata = (params: Readonly<Params<string>>): Metadata => ({
    password: {
        visible: params.salasana === 'true',
        disabled: false,
        required: true,
    },
    tyosahkopostiosoite: {
        visible: params.tyosahkopostiosoite === 'true',
        disabled: false,
        required: true,
    },
});

const getErrors = (values: Values, metadata: Metadata, L: Localisations): Errors => {
    const errors: Errors = [];

    if (!values.password && metadata.password?.visible && metadata.password?.required) {
        errors.push({ name: 'password', text: L['LOMAKE_PAKOLLINEN_TIETO'] });
    }
    if (!values.passwordAgain && metadata.tyosahkopostiosoite?.visible && metadata.tyosahkopostiosoite?.required) {
        errors.push({ name: 'tyosahkopostiosoite', text: L['LOMAKE_PAKOLLINEN_TIETO'] });
    }

    if (values.password) {
        if (!isValidPassword(values.password)) {
            errors.push({
                name: 'password',
                text: L['SALASANA_OHJE_UUDELLEENREKISTEROINTI'],
            });
        }
        if (values.password !== values.passwordAgain) {
            errors.push({
                name: 'password',
                text: L['REKISTEROIDY_ERROR_PASSWORD_MATCH'],
            });
        }
    }
    return errors;
};

export const VahvaTunnistusLisatiedotContainer = () => {
    const navigate = useNavigate();
    const { getLocalisations } = useLocalisations();
    const params = useParams();
    const locale = toSupportedLocale(params.locale);
    const L = getLocalisations(params.locale);
    const [postUudelleenRekisterointi] = usePostUudelleenRekisterointiMutation();

    useTitle(L['TITLE_VIRKAILIJA_UUDELLEENTUNNISTAUTUMINEN']);

    const [form, setForm] = useState({
        values: getInitialValues(),
        metadata: getInitialMetadata(params),
        errors: getErrors(getInitialValues(), getInitialMetadata(params), L),
        submitted: false,
    });

    const onChange = (name: string, value: string) => {
        const values = { ...form.values, [name]: value };
        refreshForm(values);
    };

    const refreshForm = (values: Values, optionalErrors: Errors = []) => {
        let errors = getErrors(values, form.metadata, L);

        if (optionalErrors) {
            errors = errors.concat([...optionalErrors]);
        }

        const newForm = { ...form, values: values, errors: errors };
        setForm(newForm);
    };

    const onSubmit = async () => {
        refreshForm({ ...form.values });
        const newForm = { ...form, submitted: true };
        setForm(newForm);
        if (form.errors.length === 0 && params.loginToken) {
            await postUudelleenRekisterointi({
                kielisyys: locale,
                loginToken: params.loginToken,
                body: { ...form.values, salasana: form.values.password },
            })
                .unwrap()
                .then(() => {
                    navigate(`/kayttaja/vahvatunnistusinfo/valmis/${locale}`);
                })
                .catch((error) => {
                    if (isApiError(error)) {
                        if (error?.data?.errorType === 'PasswordException') {
                            refreshForm({ ...form.values }, [
                                {
                                    name: 'password',
                                    text: L['SALASANA_VANHA_UUDELLEENREKISTEROINTI'],
                                },
                            ]);
                        } else {
                            navigate(`/kayttaja/vahvatunnistusinfo/virhe/${locale}/${params.loginToken}`);
                        }
                    }
                });
        }
    };

    return (
        <div className="infoPageWrapper">
            <h2 className="oph-h2 oph-bold">{L['UUDELLEENREKISTEROINTI_OTSIKKO']}</h2>
            <div className="VahvaTunnistusLisatiedotPage_ohje">{L['UUDELLEENREKISTEROINTI_OHJE']}</div>
            <form onSubmit={onSubmit}>
                <VahvaTunnistusLisatiedotInputs L={L} form={form} onChange={onChange} />
                <button type="submit" className="oph-button oph-button-primary">
                    {L['UUDELLEENREKISTEROINTI_TALLENNA_JA_JATKA']}
                </button>
            </form>
        </div>
    );
};
