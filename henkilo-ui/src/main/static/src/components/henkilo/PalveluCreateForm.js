// @flow
import React from 'react'
import type {PalvelukayttajaCreate} from '../../types/domain/kayttooikeus/palvelukayttaja.types'
import type {Localisations} from "../../types/localisation.type";

type PalveluCreateFormProps = {
    onSubmit: (PalvelukayttajaCreate) => Promise<void>,
    L: Localisations,
}

type State = {
    kayttaja: PalvelukayttajaCreate,
}

/**
 * Palvelukäyttäjän luonti -lomake.
 */
class PalveluCreateForm extends React.Component<PalveluCreateFormProps, State> {

    constructor(props : PalveluCreateFormProps) {
        super(props);

        this.state = {kayttaja: {nimi: ''}};
    }

    render() {
        const invalid = !this.state.kayttaja.nimi;
        return (
            <form onSubmit={this.onSubmit}>
                <div className="oph-field oph-field-is-required">
                    <label htmlFor="nimi"
                           className="oph-label">{this.props.L['HENKILO_PALVELUN_NIMI']}</label>
                    <input id="nimi"
                           className="oph-input"
                           placeholder={this.props.L['HENKILO_PALVELUN_NIMI']}
                           type="text"
                           name="nimi"
                           value={this.state.kayttaja.nimi}
                           onChange={this.onHenkiloInputChange} />
                </div>
                <div className="oph-field">
                    <button type="submit"
                            className="oph-button oph-button-primary"
                            disabled={invalid}>
                        {this.props.L['TALLENNA_LINKKI']}
                    </button>
                </div>
            </form>
        )
    }

    onHenkiloInputChange = (event : SyntheticEvent<HTMLInputElement>) => {
        this.setState({kayttaja: {...this.state.kayttaja, [event.currentTarget.name]: event.currentTarget.value}});
    };

    onSubmit = async (event : SyntheticEvent<HTMLButtonElement>) => {
        event.preventDefault();
        this.props.onSubmit(this.state.kayttaja);
    };

}

export default PalveluCreateForm;
