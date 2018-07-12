// @flow
import React from 'react'
import type { VirkailijaCreate } from '../../types/domain/kayttooikeus/virkailija.types'
import type { L } from "../../types/localisation.type";
import OphField from '../common/forms/OphField'
import OphLabel from '../common/forms/OphLabel'
import OphInput from '../common/forms/OphInput'
import OphFieldText from '../common/forms/OphFieldText';

type VirkailijaCreateFormProps = {
    virkailija: VirkailijaCreate,
    disabled: boolean,
    onChange: (VirkailijaCreate) => void,
    onSubmit: (VirkailijaCreate) => Promise<void>,
    L: L,
}

/**
 * Virkailijan luonti -lomake.
 */
class VirkailijaCreateForm extends React.Component<VirkailijaCreateFormProps> {

    render() {
        return (
            <form onSubmit={this.onSubmit}>
                <OphField required={true}>
                    <OphLabel>{this.props.L['HENKILO_ETUNIMET']}</OphLabel>
                    <OphInput
                        className="oph-input"
                        placeholder={this.props.L['HENKILO_ETUNIMET']}
                        type="text"
                        name="etunimet"
                        value={this.props.virkailija.etunimet}
                        onChange={this.onInputChange}
                    />
                </OphField>
                <OphField required={true}>
                    <OphLabel>{this.props.L['HENKILO_KUTSUMANIMI']}</OphLabel>
                    <OphInput
                        className="oph-input"
                        placeholder={this.props.L['HENKILO_KUTSUMANIMI']}
                        type="text"
                        name="kutsumanimi"
                        value={this.props.virkailija.kutsumanimi}
                        onChange={this.onInputChange}
                    />
                </OphField>
                <OphField required={true}>
                    <OphLabel>{this.props.L['HENKILO_SUKUNIMI']}</OphLabel>
                    <OphInput
                        className="oph-input"
                        placeholder={this.props.L['HENKILO_SUKUNIMI']}
                        type="text"
                        name="sukunimi"
                        value={this.props.virkailija.sukunimi}
                        onChange={this.onInputChange}
                    />
                </OphField>
                <OphField required={true}>
                    <OphLabel>{this.props.L['HENKILO_KAYTTAJANIMI']}</OphLabel>
                    <OphInput
                        className="oph-input"
                        placeholder={this.props.L['HENKILO_KAYTTAJANIMI']}
                        type="text"
                        name="kayttajatunnus"
                        value={this.props.virkailija.kayttajatunnus}
                        onChange={this.onInputChange}
                    />
                </OphField>
                <OphField required={true}>
                    <OphLabel>{this.props.L['HENKILO_PASSWORD']}</OphLabel>
                    <OphInput
                        className="oph-input"
                        placeholder={this.props.L['HENKILO_PASSWORD']}
                        type="password"
                        name="salasana"
                        value={this.props.virkailija.salasana}
                        onChange={this.onInputChange}
                    />
                    <OphFieldText>{this.props.L['SALASANA_OHJE']}</OphFieldText>
                </OphField>
                <OphField required={true}>
                    <OphLabel>{this.props.L['HENKILO_PASSWORDAGAIN']}</OphLabel>
                    <OphInput
                        className="oph-input"
                        placeholder={this.props.L['HENKILO_PASSWORDAGAIN']}
                        type="password"
                        name="salasanaUudestaan"
                        value={this.props.virkailija.salasanaUudestaan}
                        onChange={this.onInputChange}
                    />
                </OphField>
                <OphField>
                    <button type="submit"
                        className="oph-button oph-button-primary"
                        disabled={this.props.disabled}>
                        {this.props.L['TALLENNA_LINKKI']}
                    </button>
                </OphField>
            </form>
        )
    }

    onInputChange = (event: SyntheticEvent<HTMLInputElement>) => {
        const muutokset = { [event.currentTarget.name]: event.currentTarget.value };
        this.props.onChange({ ...this.props.virkailija, ...muutokset });
    };

    onSubmit = (event: SyntheticEvent<HTMLButtonElement>) => {
        event.preventDefault();
        this.props.onSubmit(this.props.virkailija);
    }

}

export default VirkailijaCreateForm;
