import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../store';
import VahvaTunnistusLisatiedotPage from './VahvaTunnistusLisatiedotPage';
import { Form, Values, Metadata, Errors } from './VahvaTunnistusLisatiedotInputs';
import { Locale } from '../../types/locale.type';
import { Localisations } from '../../types/localisation.type';
import { urls } from 'oph-urls-js';
import { http } from '../../http';
import { isValidPassword } from '../../validation/PasswordValidator';

type OwnProps = {
    params: any;
    router: any;
};

type StateProps = {
    locale: Locale;
    L: Localisations;
    loginToken: string;
    salasana: boolean;
    tyosahkopostiosoite: boolean;
};

type Props = OwnProps & StateProps;

type State = {
    form: Form;
};

const getInitialValues = (): Values => ({
    password: '',
    passwordAgain: '',
    tyosahkopostiosoite: '',
});

const getInitialMetadata = (props: Props): Metadata => ({
    password: {
        visible: props.salasana,
        disabled: false,
        required: true,
    },
    tyosahkopostiosoite: {
        visible: props.tyosahkopostiosoite,
        disabled: false,
        required: true,
    },
});

class VahvaTunnistusLisatiedotContainer extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        const values = getInitialValues();
        const metadata = getInitialMetadata(props);
        const errors = this.getErrors(values, metadata, props.L);

        this.state = {
            form: {
                values: values,
                metadata: metadata,
                errors: errors,
                submitted: false,
            },
        };
    }

    render() {
        return (
            <div>
                <VahvaTunnistusLisatiedotPage
                    L={this.props.L}
                    form={this.state.form}
                    onChange={this.onChange}
                    onSubmit={this.onSubmit}
                />
            </div>
        );
    }

    onChange = (name: string, value: any) => {
        const values = { ...this.state.form.values, [name]: value };
        this.refreshForm(values);
    };

    refreshForm = (values: Values, optionalErrors: Errors = []) => {
        let errors = this.getErrors(values, this.state.form.metadata, this.props.L);

        if (optionalErrors) {
            errors = errors.concat([...optionalErrors]);
        }

        const form = { ...this.state.form, values: values, errors: errors };
        this.setState({ ...this.state, form: form });
    };

    getErrors = (values: Values, metadata: Metadata, L: Localisations): Errors => {
        let errors: Errors = [];

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

    onSubmit = async () => {
        this.refreshForm({ ...this.state.form.values });

        try {
            const form = { ...this.state.form, submitted: true };
            this.setState({ ...this.state, form: form });
            if (this.state.form.errors.length === 0) {
                const tunnistusParameters = {
                    kielisyys: this.props.locale,
                    loginToken: this.props.loginToken,
                };
                const tunnistusUrl = urls.url('kayttooikeus-service.cas.uudelleenrekisterointi', tunnistusParameters);
                const loginParameters = await http.post(tunnistusUrl, {
                    ...form.values,
                    salasana: form.values.password,
                });
                const loginUrl = urls.url('cas.login', loginParameters);
                window.location.replace(loginUrl);
            }
        } catch (error) {
            this.onServerError(error);
        }
    };

    onServerError = (error: any) => {
        const L = this.props.L;

        if (error && error.errorType === 'PasswordException') {
            this.refreshForm({ ...this.state.form.values }, [
                {
                    name: 'password',
                    text: L['SALASANA_VANHA_UUDELLEENREKISTEROINTI'],
                },
            ]);
        } else {
            this.props.router.push(`/vahvatunnistusinfo/virhe/${this.props.locale}/${this.props.loginToken}`);
        }
    };
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => ({
    locale: ownProps.params['locale'],
    L: state.l10n.localisations[ownProps.params['locale']],
    loginToken: ownProps.params['loginToken'],
    salasana: ownProps.params['salasana'] === 'true',
    tyosahkopostiosoite: ownProps.params['tyosahkopostiosoite'] === 'true',
});

export default connect<StateProps, {}, OwnProps, RootState>(mapStateToProps)(VahvaTunnistusLisatiedotContainer);
