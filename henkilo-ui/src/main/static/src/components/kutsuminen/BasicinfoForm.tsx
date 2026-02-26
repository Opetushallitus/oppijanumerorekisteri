import React from 'react';
import Select, { SingleValue } from 'react-select';

import { KutsuBasicInfo } from '../../types/KutsuBasicInfo.types';
import { SelectOption } from '../../utilities/select';
import { Locale } from '../../types/locale.type';
import { useAsiointikielet, useLocalisations } from '../../selectors';

import './BasicinfoForm.css';

type Props = {
    disabled: boolean;
    basicInfo: KutsuBasicInfo;
    locale: Locale;
    setBasicInfo: (arg0: KutsuBasicInfo) => void;
};

const BasicinfoForm = (props: Props) => {
    const { L } = useLocalisations();
    const { basicInfo } = props;
    const asiointikielet = useAsiointikielet(props.locale);

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
            <h2>{L('VIRKAILIJAN_TIEDOT_OTSIKKO')}</h2>
            <ul className="flex-outer">
                <li>
                    <label>{L('VIRKAILIJAN_TIEDOT_ETUNIMI')}</label>
                    <input
                        type="text"
                        className="oph-input"
                        disabled={props.disabled}
                        value={basicInfo.etunimi || ''}
                        onChange={updateEtunimi}
                    />
                </li>
                <li>
                    <label>{L('VIRKAILIJAN_TIEDOT_SUKUNIMI')}</label>
                    <input
                        type="text"
                        className="oph-input"
                        disabled={props.disabled}
                        value={basicInfo.sukunimi || ''}
                        onChange={updateSukunimi}
                    />
                </li>
                <li>
                    <label>{L('VIRKAILIJAN_TIEDOT_SPOSTI')}</label>
                    <input
                        type="text"
                        className="oph-input"
                        disabled={props.disabled}
                        value={basicInfo.email}
                        onChange={updateEmail}
                    />
                </li>
                <li>
                    <label>{L('VIRKAILIJAN_TIEDOT_ASIOINTIKIELI')}</label>
                    <Select
                        name="languageSelection"
                        isDisabled={props.disabled}
                        value={asiointikielet.find((l) => l.value === basicInfo.languageCode)}
                        options={asiointikielet}
                        onChange={selectLanguage}
                    />
                </li>
                <li>
                    <label>{L('VIRKAILIJAN_TIEDOT_SAATE')}</label>
                    <textarea
                        className="oph-input"
                        value={basicInfo.saate}
                        style={{ marginTop: '10px' }}
                        placeholder="Valinnainen saate"
                        onChange={updateSaate}
                    />
                </li>
                <div className="oph-field-text">{L('VIRKAILIJAN_LISAYS_ASIOINTIKIELI_TARKENNE')}</div>
            </ul>
        </fieldset>
    );
};

export default BasicinfoForm;
