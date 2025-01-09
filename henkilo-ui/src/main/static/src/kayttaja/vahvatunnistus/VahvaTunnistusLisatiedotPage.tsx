import React from 'react';
import './VahvaTunnistusLisatiedotPage.css';

import VahvaTunnistusLisatiedotForm from './VahvaTunnistusLisatiedotForm';
import { Form } from './VahvaTunnistusLisatiedotInputs';
import { Localisations } from '../../types/localisation.type';

type VahvaTunnistusLisatiedotPageProps = {
    L: Localisations;
    form: Form;
    onChange: (name: string, value: string) => void;
    onSubmit: () => Promise<void>;
};

class VahvaTunnistusLisatiedotPage extends React.Component<VahvaTunnistusLisatiedotPageProps> {
    render() {
        return (
            <div className="infoPageWrapper">
                <h2 className="oph-h2 oph-bold">{this.props.L['UUDELLEENREKISTEROINTI_OTSIKKO']}</h2>
                <div className="VahvaTunnistusLisatiedotPage_ohje">{this.props.L['UUDELLEENREKISTEROINTI_OHJE']}</div>
                <VahvaTunnistusLisatiedotForm
                    L={this.props.L}
                    form={this.props.form}
                    onChange={this.props.onChange}
                    onSubmit={this.props.onSubmit}
                />
            </div>
        );
    }
}

export default VahvaTunnistusLisatiedotPage;
