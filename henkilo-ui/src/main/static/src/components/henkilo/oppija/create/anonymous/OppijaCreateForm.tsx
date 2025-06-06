import React from 'react';
import Select from 'react-select';
import classNames from 'classnames';

import SimpleDatePicker from '../../../SimpleDatePicker';
import { HenkiloCreate } from '../../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import { Locale } from '../../../../../types/locale.type';
import { Koodisto } from '../../../../../types/domain/koodisto/koodisto.types';
import PropertySingleton from '../../../../../globals/PropertySingleton';
import { KoodistoSelect } from '../../../../common/select/KoodistoSelect';
import KielisyysSelect from '../../../../common/select/KielisyysSelect';
import { isValidKutsumanimi } from '../../../../../validation/KutsumanimiValidator';
import { Localisations } from '../../../../../types/localisation.type';
import LoaderWithText from '../../../../common/loadingbar/LoaderWithText';
import { EMAIL } from '../../../../../types/constants';
import { toLocalizedText } from '../../../../../localizabletext';
import { Kielisyys } from '../../../../../types/domain/oppijanumerorekisteri/kielisyys.types';

type Error = {
    name: string;
    value: string;
};

type Form = {
    passinumero: string | null | undefined;
    sahkoposti: string | null | undefined;
};

type OppijaCreateFormProps = {
    tallenna: (arg0: HenkiloCreate) => Promise<void>;
    locale: Locale;
    L: Localisations;
    sukupuoliKoodisto: Koodisto;
    kieliKoodisto: Koodisto;
    kansalaisuusKoodisto: Koodisto;
};

type State = {
    disabled: boolean;
    loading: boolean;
    submitted: boolean;
    errors: Array<Error>;
    henkilo: HenkiloCreate;
    form: Form;
};

const initialState = {
    disabled: false,
    loading: false,
    submitted: false,
    errors: [],
    henkilo: { etunimet: '', kutsumanimi: '', sukunimi: '' },
    form: { passinumero: '', sahkoposti: '' },
};

/**
 * Oppijan luonti -lomake.
 */
class OppijaCreateForm extends React.Component<OppijaCreateFormProps, State> {
    constructor(props: OppijaCreateFormProps) {
        super(props);

        this.state = initialState;
    }

    render() {
        // oppijanumerorekisteri käyttää kielikoodiston koodeja pienillä kirjaimilla
        const kieliKoodisto = this.props.kieliKoodisto.map((koodi) => {
            return { ...koodi, koodiArvo: koodi.koodiArvo.toLowerCase() };
        });
        return (
            <form onSubmit={this.tallenna}>
                <div className="oph-field oph-field-is-required">
                    <label className="oph-label">{this.props.L['HENKILO_ETUNIMET']}</label>
                    <input
                        className={classNames('oph-input', {
                            'oph-input-has-error': this.isSubmittedAndHasError('etunimet'),
                        })}
                        placeholder={this.props.L['HENKILO_ETUNIMET']}
                        type="text"
                        name="etunimet"
                        value={this.state.henkilo.etunimet}
                        onChange={this.onHenkiloInputChange}
                    />
                    {this.renderErrors('etunimet')}
                </div>
                <div className="oph-field oph-field-is-required">
                    <label className="oph-label">{this.props.L['HENKILO_KUTSUMANIMI']}</label>
                    <input
                        className={classNames('oph-input', {
                            'oph-input-has-error': this.hasError('kutsumanimi'),
                        })}
                        placeholder={this.props.L['HENKILO_KUTSUMANIMI']}
                        type="text"
                        name="kutsumanimi"
                        value={this.state.henkilo.kutsumanimi}
                        onChange={this.onHenkiloInputChange}
                    />
                    {this.renderErrors('kutsumanimi')}
                </div>
                <div className="oph-field oph-field-is-required">
                    <label className="oph-label">{this.props.L['HENKILO_SUKUNIMI']}</label>
                    <input
                        className={classNames('oph-input', {
                            'oph-input-has-error': this.isSubmittedAndHasError('sukunimi'),
                        })}
                        placeholder={this.props.L['HENKILO_SUKUNIMI']}
                        type="text"
                        name="sukunimi"
                        value={this.state.henkilo.sukunimi}
                        onChange={this.onHenkiloInputChange}
                    />
                    {this.renderErrors('sukunimi')}
                </div>
                <div className="oph-field oph-field-is-required">
                    <label className="oph-label">{this.props.L['HENKILO_SYNTYMAAIKA']}</label>
                    <div />
                    <SimpleDatePicker
                        className={classNames('oph-input', {
                            'oph-input-has-error': this.isSubmittedAndHasError('syntymaaika'),
                        })}
                        placeholder={this.props.L['HENKILO_SYNTYMAAIKA']}
                        value={this.state.henkilo.syntymaaika}
                        onChange={(value) =>
                            this.onHenkiloChange({
                                name: 'syntymaaika',
                                value: value,
                            })
                        }
                    />
                    {this.renderErrors('syntymaaika')}
                </div>
                <div className="oph-field oph-field-is-required">
                    <label className="oph-label">{this.props.L['HENKILO_SUKUPUOLI']}</label>
                    <KoodistoSelect
                        className={classNames({
                            'oph-input-has-error': this.isSubmittedAndHasError('sukupuoli'),
                        })}
                        placeholder={this.props.L['HENKILO_SUKUPUOLI']}
                        koodisto={this.props.sukupuoliKoodisto}
                        value={this.state.henkilo.sukupuoli}
                        onChange={(value) =>
                            this.onHenkiloChange({
                                name: 'sukupuoli',
                                value: value,
                            })
                        }
                    />
                    {this.renderErrors('sukupuoli')}
                </div>
                <div className="oph-field oph-field-is-required">
                    <label className="oph-label">{this.props.L['HENKILO_AIDINKIELI']}</label>
                    <KielisyysSelect
                        className={classNames({
                            'oph-input-has-error': this.isSubmittedAndHasError('aidinkieli'),
                        })}
                        placeholder={this.props.L['HENKILO_AIDINKIELI']}
                        koodisto={kieliKoodisto}
                        value={this.state.henkilo.aidinkieli}
                        onChange={(value) =>
                            this.onHenkiloChange({
                                name: 'aidinkieli',
                                value: value,
                            })
                        }
                    />
                    {this.renderErrors('aidinkieli')}
                </div>
                <div className="oph-field oph-field-is-required">
                    <label className="oph-label">{this.props.L['HENKILO_KANSALAISUUS']}</label>
                    <Select
                        options={this.props.kansalaisuusKoodisto
                            ?.map((k) => ({
                                value: k.koodiArvo,
                                label: toLocalizedText(this.props.locale, k.metadata, k.koodiArvo),
                            }))
                            .sort((a, b) => a.label.localeCompare(b.label))}
                        onChange={(values) =>
                            this.onHenkiloChange({
                                name: 'kansalaisuus',
                                value: values.map((v) => ({ kansalaisuusKoodi: v.value })),
                            })
                        }
                        value={this.props.kansalaisuusKoodisto
                            ?.map((k) => ({
                                value: k.koodiArvo,
                                label: toLocalizedText(this.props.locale, k.metadata, k.koodiArvo),
                            }))
                            .filter((k) =>
                                this.state.henkilo.kansalaisuus?.find((kans) => kans.kansalaisuusKoodi === k.value)
                            )}
                        isMulti={true}
                        className={classNames({
                            'oph-input-has-error': this.isSubmittedAndHasError('kansalaisuus'),
                        })}
                        placeholder={this.props.L['HENKILO_KANSALAISUUS']}
                    />
                    {this.renderErrors('kansalaisuus')}
                </div>
                <div className="oph-field">
                    <label className="oph-label">{this.props.L['HENKILO_PASSINUMERO']}</label>
                    <input
                        className={classNames('oph-input', {
                            'oph-input-has-error': this.isSubmittedAndHasError('passinumero'),
                        })}
                        placeholder={this.props.L['HENKILO_PASSINUMERO']}
                        type="text"
                        name="passinumero"
                        value={this.state.form.passinumero}
                        onChange={this.onFormInputChange}
                    />
                    {this.renderErrors('passinumero')}
                </div>
                <div className="oph-field">
                    <label className="oph-label">{this.props.L['YHTEYSTIETO_SAHKOPOSTI']}</label>
                    <input
                        className={classNames('oph-input', {
                            'oph-input-has-error': this.isSubmittedAndHasError('sahkoposti'),
                        })}
                        placeholder={this.props.L['YHTEYSTIETO_SAHKOPOSTI']}
                        type="email"
                        name="sahkoposti"
                        value={this.state.form.sahkoposti}
                        onChange={this.onFormInputChange}
                    />
                    {this.renderErrors('sahkoposti')}
                </div>
                <div className="oph-field">
                    {!this.state.loading ? (
                        <button type="submit" className="oph-button oph-button-primary" disabled={this.state.disabled}>
                            {this.props.L['TALLENNA_LINKKI']}
                        </button>
                    ) : (
                        <LoaderWithText labelkey="LOMAKE_LOADING" />
                    )}
                    {this.state.submitted && this.state.errors.length > 0 && (
                        <span className="oph-field-text oph-error">{this.props.L['LOMAKE_SISALTAA_VIRHEITA']}</span>
                    )}
                </div>
            </form>
        );
    }

    onHenkiloInputChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
        this.onHenkiloChange({
            name: event.currentTarget.name,
            value: event.currentTarget.value,
        });
    };

    onHenkiloChange = (event: { name: string; value: string | Kielisyys | { kansalaisuusKoodi: string }[] }) => {
        const henkilo = { ...this.state.henkilo, [event.name]: event.value };
        const state: State = {
            ...this.state,
            henkilo: henkilo,
        };
        const errors = [...this.state.errors];
        if (this.state.submitted) {
            state.errors = this.validate(henkilo);
        } else {
            if (!this.hasError('kutsumanimi') && !isValidKutsumanimi(henkilo.etunimet, henkilo.kutsumanimi)) {
                errors.push({
                    name: 'kutsumanimi',
                    value: this.props.L['HENKILO_KUTSUMANIMI_VALIDOINTI'],
                });
                state.errors = errors;
            } else if (this.hasError('kutsumanimi') && isValidKutsumanimi(henkilo.etunimet, henkilo.kutsumanimi)) {
                state.errors = errors.filter((error) => error.name !== 'kutsumanimi');
            }
        }
        this.setState(state);
    };

    onFormInputChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
        const form = {
            ...this.state.form,
            [event.currentTarget.name]: event.currentTarget.value,
        };
        const state: State = {
            ...this.state,
            form: form,
        };
        this.setState(state);
    };

    validate = (henkilo: HenkiloCreate) => {
        const errors = [];

        if (!henkilo.etunimet) {
            errors.push({
                name: 'etunimet',
                value: this.props.L['LOMAKE_PAKOLLINEN_TIETO'],
            });
        }
        if (!henkilo.kutsumanimi) {
            errors.push({
                name: 'kutsumanimi',
                value: this.props.L['LOMAKE_PAKOLLINEN_TIETO'],
            });
        }
        if (!isValidKutsumanimi(henkilo.etunimet, henkilo.kutsumanimi)) {
            errors.push({
                name: 'kutsumanimi',
                value: this.props.L['HENKILO_KUTSUMANIMI_VALIDOINTI'],
            });
        }
        if (!henkilo.sukunimi) {
            errors.push({
                name: 'sukunimi',
                value: this.props.L['LOMAKE_PAKOLLINEN_TIETO'],
            });
        }
        if (!henkilo.syntymaaika) {
            errors.push({
                name: 'syntymaaika',
                value: this.props.L['LOMAKE_PAKOLLINEN_TIETO'],
            });
        }
        if (!henkilo.sukupuoli) {
            errors.push({
                name: 'sukupuoli',
                value: this.props.L['LOMAKE_PAKOLLINEN_TIETO'],
            });
        }
        if (!henkilo.aidinkieli) {
            errors.push({
                name: 'aidinkieli',
                value: this.props.L['LOMAKE_PAKOLLINEN_TIETO'],
            });
        }
        if (!henkilo.kansalaisuus || henkilo.kansalaisuus.length === 0) {
            errors.push({
                name: 'kansalaisuus',
                value: this.props.L['LOMAKE_PAKOLLINEN_TIETO'],
            });
        }

        return errors;
    };

    isSubmittedAndHasError = (name: string): boolean => {
        return this.state.submitted && this.state.errors.findIndex((error) => error.name === name) !== -1;
    };

    hasError = (name: string): boolean => this.state.errors.findIndex((error) => error.name === name) !== -1;

    renderErrors = (name: string) => {
        return this.state.errors.filter((error) => error.name === name).map(this.renderError);
    };

    renderError = (error: Error, index: number) => {
        return (
            <div key={index} className="oph-field-text oph-error">
                {error.value}
            </div>
        );
    };

    tallenna = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();

        const errors = this.validate(this.state.henkilo);
        if (errors.length > 0) {
            this.setState({ submitted: true, errors: errors });
        } else {
            this.setState({ disabled: true, loading: true });
            try {
                await this.props.tallenna(this.getHenkilo());
            } catch (_error) {
                this.setState({ disabled: false, loading: true });
            }
        }
    };

    // palauttaa lomakkeelta henkilön kaikki tiedot valmiina lähetettäväksi
    getHenkilo = (): HenkiloCreate => {
        const properties = PropertySingleton.getState();
        return {
            ...this.state.henkilo,
            passinumerot: this.state.form.passinumero ? [this.state.form.passinumero] : null,
            yhteystiedotRyhma: this.state.form.sahkoposti
                ? [
                      {
                          ryhmaKuvaus: properties.KOTIOSOITE,
                          ryhmaAlkuperaTieto: properties.YHTEYSTIETO_ALKUPERA_VIRKAILIJA_UI,
                          yhteystieto: [
                              {
                                  yhteystietoTyyppi: EMAIL,
                                  yhteystietoArvo: this.state.form.sahkoposti,
                              },
                          ],
                      },
                  ]
                : null,
        };
    };
}

export default OppijaCreateForm;
