import React, { useState } from 'react';
import Select from 'react-select';
import { format, parseISO } from 'date-fns';
import classNames from 'classnames';
import ReactDatePicker from 'react-datepicker';

import { HenkiloCreate } from '../../../../../types/domain/oppijanumerorekisteri/henkilo.types';
import PropertySingleton from '../../../../../globals/PropertySingleton';
import { isValidKutsumanimi } from '../../../../../validation/KutsumanimiValidator';
import { EMAIL } from '../../../../../types/constants';
import { Kielisyys } from '../../../../../types/domain/oppijanumerorekisteri/kielisyys.types';
import {
    useKansalaisuusOptions,
    useKieliOptions,
    useLocalisations,
    useSukupuoliOptions,
} from '../../../../../selectors';
import { Kansalaisuus } from '../../../../../types/domain/oppijanumerorekisteri/kansalaisuus.types';
import Loader from '../../../../common/icons/Loader';

type Error = {
    name: string;
    value: string;
};

type Form = {
    passinumero: string | undefined;
    sahkoposti: string | undefined;
};

type OppijaCreateFormProps = {
    tallenna: (arg0: HenkiloCreate) => Promise<void>;
};

type State = {
    disabled: boolean;
    loading: boolean;
    submitted: boolean;
    errors: Error[];
    henkilo: HenkiloCreate;
    form: Form;
};

const initialState: State = {
    disabled: false,
    loading: false,
    submitted: false,
    errors: [],
    henkilo: { etunimet: '', kutsumanimi: '', sukunimi: '', passinumerot: null, yhteystiedotRyhma: null },
    form: { passinumero: '', sahkoposti: '' },
};

/**
 * Oppijan luonti -lomake.
 */
const OppijaCreateForm = (props: OppijaCreateFormProps) => {
    const { L, locale } = useLocalisations();
    const kieliOptions = useKieliOptions(locale);
    const kansalaisuusOptions = useKansalaisuusOptions(locale);
    const sukupuoliOptions = useSukupuoliOptions(locale);
    const [state, setState] = useState<State>(initialState);

    const onHenkiloInputChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
        onHenkiloChange({
            name: event.currentTarget.name,
            value: event.currentTarget.value,
        });
    };

    const onHenkiloChange = (event: {
        name: string;
        value: string | Kielisyys | Kansalaisuus[] | null | undefined;
    }) => {
        const henkilo = { ...state.henkilo, [event.name]: event.value };
        const newState: State = {
            ...state,
            henkilo: henkilo,
        };
        const errors = [...newState.errors];
        if (newState.submitted) {
            newState.errors = validate(henkilo);
        } else {
            if (!hasError('kutsumanimi') && !isValidKutsumanimi(henkilo.etunimet, henkilo.kutsumanimi)) {
                errors.push({
                    name: 'kutsumanimi',
                    value: L['HENKILO_KUTSUMANIMI_VALIDOINTI']!,
                });
                newState.errors = errors;
            } else if (hasError('kutsumanimi') && isValidKutsumanimi(henkilo.etunimet, henkilo.kutsumanimi)) {
                newState.errors = errors.filter((error) => error.name !== 'kutsumanimi');
            }
        }
        setState(newState);
    };

    const onFormInputChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
        const form = {
            ...state.form,
            [event.currentTarget.name]: event.currentTarget.value,
        };
        const newState: State = {
            ...state,
            form: form,
        };
        setState(newState);
    };

    const validate = (henkilo: HenkiloCreate) => {
        const errors = [];

        if (!henkilo.etunimet) {
            errors.push({
                name: 'etunimet',
                value: L['LOMAKE_PAKOLLINEN_TIETO']!,
            });
        }
        if (!henkilo.kutsumanimi) {
            errors.push({
                name: 'kutsumanimi',
                value: L['LOMAKE_PAKOLLINEN_TIETO']!,
            });
        }
        if (!isValidKutsumanimi(henkilo.etunimet, henkilo.kutsumanimi)) {
            errors.push({
                name: 'kutsumanimi',
                value: L['HENKILO_KUTSUMANIMI_VALIDOINTI']!,
            });
        }
        if (!henkilo.sukunimi) {
            errors.push({
                name: 'sukunimi',
                value: L['LOMAKE_PAKOLLINEN_TIETO']!,
            });
        }
        if (!henkilo.syntymaaika) {
            errors.push({
                name: 'syntymaaika',
                value: L['LOMAKE_PAKOLLINEN_TIETO']!,
            });
        }
        if (!henkilo.sukupuoli) {
            errors.push({
                name: 'sukupuoli',
                value: L['LOMAKE_PAKOLLINEN_TIETO']!,
            });
        }
        if (!henkilo.aidinkieli) {
            errors.push({
                name: 'aidinkieli',
                value: L['LOMAKE_PAKOLLINEN_TIETO']!,
            });
        }
        if (!henkilo.kansalaisuus || henkilo.kansalaisuus.length === 0) {
            errors.push({
                name: 'kansalaisuus',
                value: L['LOMAKE_PAKOLLINEN_TIETO']!,
            });
        }

        return errors;
    };

    const isSubmittedAndHasError = (name: string): boolean => {
        return state.submitted && state.errors.findIndex((error) => error.name === name) !== -1;
    };

    const hasError = (name: string): boolean => state.errors.findIndex((error) => error.name === name) !== -1;

    const renderErrors = (name: string) => {
        return state.errors.filter((error) => error.name === name).map(renderError);
    };

    const renderError = (error: Error, index: number) => {
        return (
            <div key={index} className="oph-field-text oph-error">
                {error.value}
            </div>
        );
    };

    const tallenna = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();

        const errors = validate(state.henkilo);
        if (errors.length > 0) {
            setState({ ...state, submitted: true, errors: errors });
        } else {
            setState({ ...state, disabled: true, loading: true });
            try {
                await props.tallenna(getHenkilo());
            } catch (_error) {
                setState({ ...state, disabled: false, loading: true });
            }
        }
    };

    // palauttaa lomakkeelta henkilön kaikki tiedot valmiina lähetettäväksi
    const getHenkilo = (): HenkiloCreate => {
        const properties = PropertySingleton.getState();
        return {
            ...state.henkilo,
            passinumerot: state.form.passinumero ? [state.form.passinumero] : null,
            yhteystiedotRyhma: state.form.sahkoposti
                ? [
                      {
                          ryhmaKuvaus: properties.KOTIOSOITE ?? '',
                          ryhmaAlkuperaTieto: properties.YHTEYSTIETO_ALKUPERA_VIRKAILIJA_UI,
                          yhteystieto: [
                              {
                                  yhteystietoTyyppi: EMAIL,
                                  yhteystietoArvo: state.form.sahkoposti,
                              },
                          ],
                      },
                  ]
                : null,
        };
    };

    return (
        <form onSubmit={tallenna}>
            <div className="oph-field oph-field-is-required">
                <label className="oph-label">{L['HENKILO_ETUNIMET']}</label>
                <input
                    className={classNames('oph-input', {
                        'oph-input-has-error': isSubmittedAndHasError('etunimet'),
                    })}
                    placeholder={L['HENKILO_ETUNIMET']}
                    type="text"
                    name="etunimet"
                    onChange={onHenkiloInputChange}
                />
                {renderErrors('etunimet')}
            </div>
            <div className="oph-field oph-field-is-required">
                <label className="oph-label">{L['HENKILO_KUTSUMANIMI']}</label>
                <input
                    className={classNames('oph-input', {
                        'oph-input-has-error': hasError('kutsumanimi'),
                    })}
                    placeholder={L['HENKILO_KUTSUMANIMI']}
                    type="text"
                    name="kutsumanimi"
                    onChange={onHenkiloInputChange}
                />
                {renderErrors('kutsumanimi')}
            </div>
            <div className="oph-field oph-field-is-required">
                <label className="oph-label">{L['HENKILO_SUKUNIMI']}</label>
                <input
                    className={classNames('oph-input', {
                        'oph-input-has-error': isSubmittedAndHasError('sukunimi'),
                    })}
                    placeholder={L['HENKILO_SUKUNIMI']}
                    type="text"
                    name="sukunimi"
                    onChange={onHenkiloInputChange}
                />
                {renderErrors('sukunimi')}
            </div>
            <div className="oph-field oph-field-is-required">
                <label className="oph-label">{L['HENKILO_SYNTYMAAIKA']}</label>
                <div />
                <ReactDatePicker
                    className={`oph-input ${isSubmittedAndHasError('syntymaaika') ? 'oph-input-has-error' : ''}`}
                    onChange={(date) =>
                        onHenkiloChange({
                            name: 'syntymaaika',
                            value: date ? format(date, 'yyyy-MM-dd') : null,
                        })
                    }
                    selected={state.henkilo.syntymaaika ? parseISO(state.henkilo.syntymaaika) : null}
                    showYearDropdown
                    showWeekNumbers
                    dateFormat={'d.M.yyyy'}
                />
                {renderErrors('syntymaaika')}
            </div>
            <div className="oph-field oph-field-is-required">
                <label className="oph-label">{L['HENKILO_SUKUPUOLI']}</label>
                <Select
                    options={sukupuoliOptions}
                    onChange={(value) =>
                        onHenkiloChange({
                            name: 'sukupuoli',
                            value: value?.value,
                        })
                    }
                    value={sukupuoliOptions.find((k) => state.henkilo.sukupuoli === k.value)}
                    className={classNames({
                        'oph-input-has-error': isSubmittedAndHasError('sukupuoli'),
                    })}
                    placeholder={L['HENKILO_SUKUPUOLI']}
                />
                {renderErrors('sukupuoli')}
            </div>
            <div className="oph-field oph-field-is-required">
                <label className="oph-label">{L['HENKILO_AIDINKIELI']}</label>
                <Select
                    options={kieliOptions}
                    onChange={(value) =>
                        onHenkiloChange({
                            name: 'aidinkieli',
                            value: value ? { kieliKoodi: value.value } : null,
                        })
                    }
                    value={kieliOptions.find((k) => state.henkilo.aidinkieli?.kieliKoodi === k.value)}
                    className={classNames({
                        'oph-input-has-error': isSubmittedAndHasError('aidinkieli'),
                    })}
                    placeholder={L['HENKILO_AIDINKIELI']}
                />
                {renderErrors('aidinkieli')}
            </div>
            <div className="oph-field oph-field-is-required">
                <label className="oph-label">{L['HENKILO_KANSALAISUUS']}</label>
                <Select
                    options={kansalaisuusOptions}
                    onChange={(values) =>
                        onHenkiloChange({
                            name: 'kansalaisuus',
                            value: values.map((v) => ({ kansalaisuusKoodi: v.value })),
                        })
                    }
                    value={kansalaisuusOptions.filter((k) =>
                        state.henkilo.kansalaisuus?.find((kans) => kans.kansalaisuusKoodi === k.value)
                    )}
                    isMulti={true}
                    className={classNames({
                        'oph-input-has-error': isSubmittedAndHasError('kansalaisuus'),
                    })}
                    placeholder={L['HENKILO_KANSALAISUUS']}
                />
                {renderErrors('kansalaisuus')}
            </div>
            <div className="oph-field">
                <label className="oph-label">{L['HENKILO_PASSINUMERO']}</label>
                <input
                    className={classNames('oph-input', {
                        'oph-input-has-error': isSubmittedAndHasError('passinumero'),
                    })}
                    placeholder={L['HENKILO_PASSINUMERO']}
                    type="text"
                    name="passinumero"
                    onChange={onFormInputChange}
                />
                {renderErrors('passinumero')}
            </div>
            <div className="oph-field">
                <label className="oph-label">{L['YHTEYSTIETO_SAHKOPOSTI']}</label>
                <input
                    className={classNames('oph-input', {
                        'oph-input-has-error': isSubmittedAndHasError('sahkoposti'),
                    })}
                    placeholder={L['YHTEYSTIETO_SAHKOPOSTI']}
                    type="email"
                    name="sahkoposti"
                    onChange={onFormInputChange}
                />
                {renderErrors('sahkoposti')}
            </div>
            <div className="oph-field">
                {!state.loading ? (
                    <button type="submit" className="oph-button oph-button-primary" disabled={state.disabled}>
                        {L['TALLENNA_LINKKI']}
                    </button>
                ) : (
                    <div style={{ display: 'inline-block' }}>
                        <Loader />
                        <span>{L['LOMAKE_LOADING']}</span>
                    </div>
                )}
                {state.submitted && state.errors.length > 0 && (
                    <span className="oph-field-text oph-error">{L['LOMAKE_SISALTAA_VIRHEITA']}</span>
                )}
            </div>
        </form>
    );
};

export default OppijaCreateForm;
