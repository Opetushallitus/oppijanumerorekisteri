// @flow
import React from 'react'
import './VahvaTunnistusLisatiedotPage.css'
import InfoPage from '../common/page/InfoPage'
import VahvaTunnistusLisatiedotForm from './VahvaTunnistusLisatiedotForm'
import type { Form } from './VahvaTunnistusLisatiedotInputs'
import type { Localisations } from '../../types/localisation.type'

type VahvaTunnistusLisatiedotPageProps = {
    L: Localisations,
    form: Form,
    onChange: (name: string, value: any) => void,
    onSubmit: () => Promise<*>,
}

class VahvaTunnistusLisatiedotPage extends React.Component<VahvaTunnistusLisatiedotPageProps> {

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
