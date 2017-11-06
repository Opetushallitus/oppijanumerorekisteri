// @flow
import React from 'react'
import type {HenkiloCreate} from '../../types/domain/oppijanumerorekisteri/henkilo.types'
import type {HenkiloCreate} from '../../types/henkilo.type'
import type {L} from "../../types/l.type";

type Props = {
    onSubmit: (HenkiloCreate) => Promise<void>,
    L: L,
}

type State = {
    henkilo: HenkiloCreate,
}

/**
 * Palvelukäyttäjän luonti -lomake.
 */
class PalveluCreateForm extends React.Component<Props, State> {

    constructor(props : Props) {
        super(props);

        this.state = {
            henkilo: {
                etunimet: '_',
                kutsumanimi: '_',
                sukunimi: '',
                henkiloTyyppi: 'PALVELU',
            },
        };
    }

    render() {
        const invalid = !this.state.henkilo.sukunimi;
        return (
            <form onSubmit={this.onSubmit}>
                <div className="oph-field oph-field-is-required">
                    <label htmlFor="sukunimi"
                           className="oph-label">{this.props.L['HENKILO_PALVELUN_NIMI']}</label>
                    <input id="sukunimi"
                           className="oph-input"
                           placeholder={this.props.L['HENKILO_PALVELUN_NIMI']}
                           type="text"
                           name="sukunimi"
                           value={this.state.henkilo.sukunimi}
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
        this.setState({henkilo: {...this.state.henkilo, [event.currentTarget.name]: event.currentTarget.value}});
    }

    onSubmit = async (event : SyntheticEvent<HTMLButtonElement>) => {
        event.preventDefault();
        this.props.onSubmit(this.state.henkilo);
    }

};

export default PalveluCreateForm;
