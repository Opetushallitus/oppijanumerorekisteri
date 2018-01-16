// @flow
import React from 'react'
import { connect } from 'react-redux'
import { updateUnauthenticatedNavigation } from '../../actions/navigation.actions'
import VahvaTunnistusLisatiedotPage from './VahvaTunnistusLisatiedotPage'
import type { Form, Values, Metadata, Errors } from './VahvaTunnistusLisatiedotInputs'
import type { Locale } from '../../types/locale.type'
import type { L } from '../../types/localisation.type'
import { urls } from 'oph-urls-js'
import { http } from '../../http'

type Props = {
    updateUnauthenticatedNavigation: () => void,
    router: any,
    locale: Locale,
    L: L,
    loginToken: string,
    onTyosahkopostiosoite: boolean,
}

type State = {
    form: Form,
}

const getInitialValues = (): Values => ({
    salasana: '',
    tyosahkopostiosoite: '',
})

const getInitialMetadata = (props: Props): Metadata => ({
    salasana: {
        visible: true,
        disabled: false,
        required: true,
    },
    tyosahkopostiosoite: {
        visible: !props.onTyosahkopostiosoite,
        disabled: false,
        required: true,
    },
})

class VahvaTunnistusLisatiedotContainer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        const values = getInitialValues()
        const metadata = getInitialMetadata(props)
        const errors = this.getErrors(values, metadata, props.L)
        this.state = {
            form: {
                values: values,
                metadata: metadata,
                errors: errors,
                submitted: false,
            },
        }
    }

    componentDidMount() {
        this.props.updateUnauthenticatedNavigation()
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
        )
    }

    onChange = (name: string, value: any) => {
        const values = { ...this.state.form.values, [name]: value }
        const errors = this.getErrors(values, this.state.form.metadata, this.props.L)
        const form = { ...this.state.form, values: values, errors: errors }
        this.setState({ ...this.state, form: form })
    }

    getErrors = (values: Values, metadata: Metadata, L: L): Errors => {
        let errors: Errors = []
        // tarkistetaan pakollisuudet
        Object.entries(values).forEach(([name, value]) => {
            if (!value && metadata[name] && metadata[name].visible && metadata[name].required) {
                errors.push({ name: name, text: L['LOMAKE_PAKOLLINEN_TIETO'] })
            }
        })
        if (values.salasana) {
            // TODO: lisää salasanavalidointi (KJHH-984)
        }
        return errors
    }

    onSubmit = async () => {
        try {
            const form = { ...this.state.form, submitted: true }
            this.setState({ ...this.state, form: form })
            if (this.state.form.errors.length === 0) {
                const tunnistusParameters = { kielisyys: this.props.locale, loginToken: this.props.loginToken }
                const tunnistusUrl = urls.url('kayttooikeus-service.cas.tunnistus.lisatiedot', tunnistusParameters)
                const loginParameters = await http.post(tunnistusUrl, form.values)
                const loginUrl = urls.url('cas.login', loginParameters)
                window.location.replace(loginUrl)
            }
        } catch (error) {
            this.props.router.push(`/vahvatunnistusinfo/virhe/${this.props.locale}/${this.props.loginToken}`)
        }
    }

}

const mapStateToProps = (state, ownProps) => ({
    locale: ownProps.params['locale'],
    L: state.l10n.localisations[ownProps.params['locale']],
    loginToken: ownProps.params['loginToken'],
    onTyosahkopostiosoite: ownProps.params['onTyosahkopostiosoite'] === 'true'
})

export default connect(mapStateToProps, {
    updateUnauthenticatedNavigation,
})(VahvaTunnistusLisatiedotContainer)
