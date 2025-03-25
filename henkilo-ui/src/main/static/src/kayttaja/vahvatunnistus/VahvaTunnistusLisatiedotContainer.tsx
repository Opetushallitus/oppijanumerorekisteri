import React from 'react';
import { connect } from 'react-redux';
import { RouteActions } from 'react-router-redux';

import type { KayttajaRootState } from '../store';
import VahvaTunnistusLisatiedotPage from './VahvaTunnistusLisatiedotPage';
import { Form, Values, Metadata, Errors } from './VahvaTunnistusLisatiedotInputs';
import { Locale } from '../../types/locale.type';
import { Localisations } from '../../types/localisation.type';
import { urls } from 'oph-urls-js';
import { http } from '../../http';
import { isValidPassword } from '../../validation/PasswordValidator';

type OwnProps = {
    params: { locale?: Locale; loginToken?: string; salasana?: string; tyosahkopostiosoite?: string };
    router: RouteActions;
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

    componentDidMount() {
        document.title = this.props.L['TITLE_VIRKAILIJA_UUDELLEENTUNNISTAUTUMINEN'];
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

    onChange = (name: string, value: string) => {
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
                await http.post(tunnistusUrl, {
                    ...form.values,
                    salasana: form.values.password,
                });
                this.props.router.push(`/vahvatunnistusinfo/valmis/${this.props.locale}`);
            }
        } catch (error) {
            this.onServerError(error);
        }
    };

    onServerError = (error: { errorType?: string }) => {
        const L = this.props.L;

        if (error?.errorType === 'PasswordException') {
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

const mapStateToProps = (state: KayttajaRootState, ownProps: OwnProps): StateProps => ({
    locale: ownProps.params['locale'],
    L: state.l10n.localisations[ownProps.params['locale']],
    loginToken: ownProps.params['loginToken'],
    salasana: ownProps.params['salasana'] === 'true',
    tyosahkopostiosoite: ownProps.params['tyosahkopostiosoite'] === 'true',
});

export default connect<StateProps, object, OwnProps, KayttajaRootState>(mapStateToProps)(
    VahvaTunnistusLisatiedotContainer
);
