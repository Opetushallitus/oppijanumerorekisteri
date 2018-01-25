// @flow
import React from 'react'
import './VahvaTunnistusLisatiedotPage.css'
import InfoPage from '../common/page/InfoPage'
import VahvaTunnistusLisatiedotForm from './VahvaTunnistusLisatiedotForm'
import type { Form } from './VahvaTunnistusLisatiedotInputs'
import type { L } from '../../types/localisation.type'

type Props = {
    L: L,
    form: Form,
    onChange: (name: string, value: any) => void,
    onSubmit: () => Promise<*>,
}

class VahvaTunnistusLisatiedotPage extends React.Component<Props> {

    render() {
        return (
            <InfoPage topicLocalised={this.props.L['UUDELLEENREKISTEROINTI_OTSIKKO']}>
                <div className="VahvaTunnistusLisatiedotPage_ohje">
                    {this.props.L['UUDELLEENREKISTEROINTI_OHJE']}
                </div>
                <VahvaTunnistusLisatiedotForm
                    L={this.props.L}
                    form={this.props.form}
                    onChange={this.props.onChange}
                    onSubmit={this.props.onSubmit}
                />
            </InfoPage>
        )
    }

}

export default VahvaTunnistusLisatiedotPage
