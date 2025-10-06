import React, { useState } from 'react';
import { Params, useNavigate, useParams } from 'react-router';
import { urls } from 'oph-urls-js';

import VahvaTunnistusLisatiedotInputs, { Values, Metadata, Errors } from './VahvaTunnistusLisatiedotInputs';
import { Localisations } from '../../types/localisation.type';
import { http } from '../../http';
import { isValidPassword } from '../../validation/PasswordValidator';
import { toSupportedLocale, useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';

import './VahvaTunnistusLisatiedotPage.css';

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

    // tarkistetaan pakollisuudet
    Object.entries(values).forEach(([name, value]) => {
        if (!value && metadata[name] && metadata[name].visible && metadata[name].required) {
            errors.push({ name: name, text: L['LOMAKE_PAKOLLINEN_TIETO'] });
        }
    });

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

        try {
            const newForm = { ...form, submitted: true };
            setForm(newForm);
            if (form.errors.length === 0) {
                const tunnistusParameters = {
                    kielisyys: locale,
                    loginToken: params.loginToken,
                };
                const tunnistusUrl = urls.url('kayttooikeus-service.cas.uudelleenrekisterointi', tunnistusParameters);
                await http.post(tunnistusUrl, {
                    ...form.values,
                    salasana: form.values.password,
                });
                navigate(`/kayttaja/vahvatunnistusinfo/valmis/${locale}`);
            }
        } catch (error) {
            onServerError(error);
        }
    };

    const onServerError = (error: { errorType?: string }) => {
        if (error?.errorType === 'PasswordException') {
            refreshForm({ ...form.values }, [
                {
                    name: 'password',
                    text: L['SALASANA_VANHA_UUDELLEENREKISTEROINTI'],
                },
            ]);
        } else {
            navigate(`/kayttaja/vahvatunnistusinfo/virhe/${locale}/${params.loginToken}`);
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
