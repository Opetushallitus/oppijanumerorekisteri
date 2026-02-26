import React from 'react';

import { VirkailijaCreate } from '../../types/domain/kayttooikeus/virkailija.types';
import { useLocalisations } from '../../selectors';

type VirkailijaCreateFormProps = {
    virkailija: VirkailijaCreate;
    disabled: boolean;
    onChange: (arg0: VirkailijaCreate) => void;
    onSubmit: (arg0: VirkailijaCreate) => Promise<void>;
};

/**
 * Virkailijan luonti -lomake.
 */
const VirkailijaCreateForm = (props: VirkailijaCreateFormProps) => {
    const { L } = useLocalisations();

    const onInputChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
        const muutokset = {
            [event.currentTarget.name]: event.currentTarget.value,
        };
        props.onChange({ ...props.virkailija, ...muutokset });
    };

    const onSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        props.onSubmit(props.virkailija);
    };

    return (
        <form onSubmit={onSubmit}>
            <div className="oph-field oph-field-is-required">
                <label className="oph-label" htmlFor="etunimet">
                    {L('HENKILO_ETUNIMET')}
                </label>
                <input
                    className="oph-input"
                    placeholder={L('HENKILO_ETUNIMET')}
                    type="text"
                    name="etunimet"
                    value={props.virkailija.etunimet}
                    onChange={onInputChange}
                />
            </div>
            <div className="oph-field oph-field-is-required">
                <label className="oph-label" htmlFor="kutsumanimi">
                    {L('HENKILO_KUTSUMANIMI')}
                </label>
                <input
                    className="oph-input"
                    placeholder={L('HENKILO_KUTSUMANIMI')}
                    type="text"
                    name="kutsumanimi"
                    value={props.virkailija.kutsumanimi}
                    onChange={onInputChange}
                />
            </div>
            <div className="oph-field oph-field-is-required">
                <label className="oph-label" htmlFor="sukunimi">
                    {L('HENKILO_SUKUNIMI')}
                </label>
                <input
                    className="oph-input"
                    placeholder={L('HENKILO_SUKUNIMI')}
                    type="text"
                    name="sukunimi"
                    value={props.virkailija.sukunimi}
                    onChange={onInputChange}
                />
            </div>
            <div className="oph-field oph-field-is-required">
                <label className="oph-label" htmlFor="kayttajatunnus">
                    {L('HENKILO_KAYTTAJANIMI')}
                </label>
                <input
                    className="oph-input"
                    placeholder={L('HENKILO_KAYTTAJANIMI')}
                    type="text"
                    name="kayttajatunnus"
                    value={props.virkailija.kayttajatunnus}
                    onChange={onInputChange}
                />
            </div>
            <div className="oph-field oph-field-is-required">
                <label className="oph-label" htmlFor="salasana">
                    {L('HENKILO_PASSWORD')}
                </label>
                <input
                    className="oph-input"
                    placeholder={L('HENKILO_PASSWORD')}
                    type="password"
                    name="salasana"
                    value={props.virkailija.salasana}
                    onChange={onInputChange}
                />
                <div className="oph-field-text">{L('SALASANA_OHJE')}</div>
            </div>
            <div className="oph-field oph-field-is-required">
                <label className="oph-label" htmlFor="salasanaUudestaan">
                    {L('HENKILO_PASSWORDAGAIN')}
                </label>
                <input
                    className="oph-input"
                    placeholder={L('HENKILO_PASSWORDAGAIN')}
                    type="password"
                    name="salasanaUudestaan"
                    value={props.virkailija.salasanaUudestaan}
                    onChange={onInputChange}
                />
            </div>
            <div>
                <button type="submit" className="oph-button oph-button-primary" disabled={props.disabled}>
                    {L('TALLENNA_LINKKI')}
                </button>
            </div>
        </form>
    );
};

export default VirkailijaCreateForm;
