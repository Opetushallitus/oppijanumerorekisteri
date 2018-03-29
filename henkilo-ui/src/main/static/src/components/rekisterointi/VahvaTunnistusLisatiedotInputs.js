// @flow
import React from 'react'
import OphField from '../common/forms/OphField'
import OphLabel from '../common/forms/OphLabel'
import OphInput from '../common/forms/OphInput'
import { LocalNotification } from '../common/Notification/LocalNotification'
import type { L } from '../../types/localisation.type'
import Salasana from "../common/henkilo/labelvalues/Salasana";

export type Values = {
    password: string,
    passwordAgain: string,
    tyosahkopostiosoite: string,
}
export type Field = {
    visible: boolean,
    disabled: boolean,
    required: boolean,
}
export type Metadata = {
    salasana: Field,
    tyosahkopostiosoite: Field,
}
export type Error = {
    name: string,
    text: string,
}
export type Errors = Array<Error>
export type Form = {
    values: Values,
    metadata: Metadata,
    errors: Errors,
    submitted: boolean,
}

type Props = {
    L: L,
    form: Form,
    onChange: (name: string, value: any) => void,
}

class VahvaTunnistusLisatiedotInputs extends React.Component<Props> {

    render() {
        return (
            <div>
                {this.props.form.metadata.salasana.visible &&
                    <OphField required={this.props.form.metadata.salasana.required}>
                        <OphLabel for="salasana" inline={true}>
                            {this.props.L['UUDELLEENREKISTEROINTI_UUSI_SALASANA']}
                        </OphLabel>
                        <Salasana disabled={this.props.form.metadata.salasana.disabled}
                                  isError={this.hasError('salasana')}
                                  L={this.props.L}
                                  updateModelFieldAction={this.onInputChange.bind(this)}
                        />
                        <LocalNotification type="error" title={this.props.L['LOMAKE_KENTTA_SISALTAA_VIRHEITA']} toggle={this.hasError('salasana')}>
                            <ul>
                                {this.props.form.errors
                                    .filter(error => error.name === 'salasana')
                                    .map((error, index) => <li key={index}>{error.text}</li>)}
                            </ul>
                        </LocalNotification>
                    </OphField>
                }
                {this.props.form.metadata.tyosahkopostiosoite.visible &&
                    <OphField required={this.props.form.metadata.tyosahkopostiosoite.required}>
                        <OphLabel for="tyosahkopostiosoite">
                        {this.props.L['UUDELLEENREKISTEROINTI_SAHKOPOSTIOSOITE']}
                        </OphLabel>
                        <OphInput
                            type="email"
                            name="tyosahkopostiosoite"
                            value={this.props.form.values.tyosahkopostiosoite}
                            onChange={this.onInputChange}
                            hasError={this.hasError('tyosahkopostiosoite')}
                            disabled={this.props.form.metadata.tyosahkopostiosoite.disabled}
                        />
                        <LocalNotification type="error" title={this.props.L['LOMAKE_KENTTA_SISALTAA_VIRHEITA']} toggle={this.hasError('tyosahkopostiosoite')}>
                        <ul>
                                {this.props.form.errors
                                    .filter(error => error.name === 'tyosahkopostiosoite')
                                    .map((error, index) => <li key={index}>{error.text}</li>)}
                            </ul>
                        </LocalNotification>
                    </OphField>
                }
            </div>
        )
    }

    hasError = (name: string): boolean => {
        return this.props.form.submitted && this.props.form.errors.some(error => error.name === name)
    }

    onInputChange = (event: SyntheticEvent<HTMLInputElement>) => {
        this.props.onChange(event.currentTarget.name, event.currentTarget.value)
    }

}

export default VahvaTunnistusLisatiedotInputs
