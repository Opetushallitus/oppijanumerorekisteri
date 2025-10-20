import React from 'react';
import Select, { SingleValue } from 'react-select';

import { Localisations } from '../../types/localisation.type';
import { KutsuBasicInfo } from '../../types/KutsuBasicInfo.types';
import { SelectOption } from '../../utilities/select';
import { Locale } from '../../types/locale.type';

import './BasicinfoForm.css';

type Props = {
    disabled: boolean;
    basicInfo: KutsuBasicInfo;
    L: Localisations;
    locale: Locale;
    setBasicInfo: (arg0: KutsuBasicInfo) => void;
};

const languages = [
    { code: 'fi', name: { fi: 'Suomi', en: 'Finnish', sv: 'Finska' } },
    { code: 'sv', name: { fi: 'Ruotsi', en: 'Swedish', sv: 'Svenska' } },
    { code: 'en', name: { fi: 'Englanti', en: 'English', sv: 'Engelska' } },
];

const BasicinfoForm = (props: Props) => {
    const { basicInfo } = props;
    const languageOptions = languages.map((language) => ({
        value: language.code,
        label: language.name[props.locale],
    }));

    function updateEmail(event: React.ChangeEvent<HTMLInputElement>) {
        const { basicInfo } = props;
        basicInfo.email = event.target.value;
        props.setBasicInfo(basicInfo);
    }

    function updateEtunimi(event: React.ChangeEvent<HTMLInputElement>) {
        const { basicInfo } = props;
        basicInfo.etunimi = event.target.value;
        props.setBasicInfo(basicInfo);
    }

    function updateSukunimi(event: React.ChangeEvent<HTMLInputElement>) {
        const { basicInfo } = props;
        basicInfo.sukunimi = event.target.value;
        props.setBasicInfo(basicInfo);
    }

    function selectLanguage(selection: SingleValue<SelectOption>) {
        const { basicInfo } = props;
        if (selection) {
            basicInfo.languageCode = selection.value;
        }
        props.setBasicInfo(basicInfo);
    }

    function updateSaate(event: React.ChangeEvent<HTMLTextAreaElement>) {
        const { basicInfo } = props;
        basicInfo.saate = event.target.value;
        props.setBasicInfo(basicInfo);
    }

    return (
        <fieldset id="basicinfo">
            <span className="oph-h2">{props.L['VIRKAILIJAN_TIEDOT_OTSIKKO']}</span>
            <ul className="flex-outer">
                <li>
                    <label>{props.L['VIRKAILIJAN_TIEDOT_ETUNIMI']}</label>
                    <input
                        type="text"
                        className="oph-input"
                        disabled={props.disabled}
                        value={basicInfo.etunimi || ''}
                        onChange={updateEtunimi}
                    />
                </li>
                <li>
                    <label>{props.L['VIRKAILIJAN_TIEDOT_SUKUNIMI']}</label>
                    <input
                        type="text"
                        className="oph-input"
                        disabled={props.disabled}
                        value={basicInfo.sukunimi || ''}
                        onChange={updateSukunimi}
                    />
                </li>
                <li>
                    <label>{props.L['VIRKAILIJAN_TIEDOT_SPOSTI']}</label>
                    <input
                        type="text"
                        className="oph-input"
                        disabled={props.disabled}
                        value={basicInfo.email}
                        onChange={updateEmail}
                    />
                </li>
                <li>
                    <label>{props.L['VIRKAILIJAN_TIEDOT_ASIOINTIKIELI']}</label>
                    <Select
                        name="languageSelection"
                        isDisabled={props.disabled}
                        value={languageOptions.find((l) => l.value === basicInfo.languageCode)}
                        options={languageOptions}
                        onChange={selectLanguage}
                    />
                </li>
                <li>
                    <label>{props.L['VIRKAILIJAN_TIEDOT_SAATE']}</label>
                    <textarea
                        className="oph-input"
                        value={basicInfo.saate}
                        style={{ marginTop: '10px' }}
                        placeholder="Valinnainen saate"
                        onChange={updateSaate}
                    />
                </li>
                <div className="oph-field-text">{props.L['VIRKAILIJAN_LISAYS_ASIOINTIKIELI_TARKENNE']}</div>
            </ul>
        </fieldset>
    );
};

export default BasicinfoForm;
