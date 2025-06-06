import React from 'react';
import Select from 'react-select';

import { Localisations } from '../../types/localisation.type';
import { KutsuBasicInfo } from '../../types/KutsuBasicInfo.types';

import './BasicinfoForm.css';
import { SelectOption } from '../../utilities/select';

type Props = {
    disabled: boolean;
    basicInfo: KutsuBasicInfo;
    L: Localisations;
    locale: string;
    setBasicInfo: (arg0: KutsuBasicInfo) => void;
};

export default class BasicinfoForm extends React.Component<Props> {
    languages = [
        { code: 'fi', name: { fi: 'Suomi', en: 'Finnish', sv: 'Finska' } },
        { code: 'sv', name: { fi: 'Ruotsi', en: 'Swedish', sv: 'Svenska' } },
        { code: 'en', name: { fi: 'Englanti', en: 'English', sv: 'Engelska' } },
    ];

    render() {
        const { basicInfo } = this.props;
        const languageOptions = this.languages.map((language) => ({
            value: language.code,
            label: language.name[this.props.locale],
        }));
        return (
            <fieldset id="basicinfo">
                <span className="oph-h2">{this.props.L['VIRKAILIJAN_TIEDOT_OTSIKKO']}</span>
                <ul className="flex-outer">
                    <li>
                        <label>{this.props.L['VIRKAILIJAN_TIEDOT_ETUNIMI']}</label>
                        <input
                            type="text"
                            className="oph-input"
                            disabled={this.props.disabled}
                            value={basicInfo.etunimi || ''}
                            onChange={this.updateEtunimi.bind(this)}
                        />
                    </li>
                    <li>
                        <label>{this.props.L['VIRKAILIJAN_TIEDOT_SUKUNIMI']}</label>
                        <input
                            type="text"
                            className="oph-input"
                            disabled={this.props.disabled}
                            value={basicInfo.sukunimi || ''}
                            onChange={this.updateSukunimi.bind(this)}
                        />
                    </li>
                    <li>
                        <label>{this.props.L['VIRKAILIJAN_TIEDOT_SPOSTI']}</label>
                        <input
                            type="text"
                            className="oph-input"
                            disabled={this.props.disabled}
                            value={basicInfo.email}
                            onChange={this.updateEmail.bind(this)}
                        />
                    </li>
                    <li>
                        <label>{this.props.L['VIRKAILIJAN_TIEDOT_ASIOINTIKIELI']}</label>
                        <Select
                            name="languageSelection"
                            isDisabled={this.props.disabled}
                            value={languageOptions.find((l) => l.value === basicInfo.languageCode)}
                            options={languageOptions}
                            onChange={this.selectLanguage.bind(this)}
                        />
                    </li>
                    <li>
                        <label>{this.props.L['VIRKAILIJAN_TIEDOT_SAATE']}</label>
                        <textarea
                            className="oph-input"
                            value={basicInfo.saate}
                            style={{ marginTop: '10px' }}
                            placeholder="Valinnainen saate"
                            onChange={this.updateSaate.bind(this)}
                        ></textarea>
                    </li>
                    <li>
                        <label htmlFor="tarkenne">&nbsp;</label>
                        <div id="tarkenne" className="oph-field-text">
                            {this.props.L['VIRKAILIJAN_LISAYS_ASIOINTIKIELI_TARKENNE']}
                        </div>
                    </li>
                </ul>
            </fieldset>
        );
    }

    updateEmail(event: React.ChangeEvent<HTMLInputElement>) {
        const { basicInfo } = this.props;
        basicInfo.email = event.target.value;
        this.props.setBasicInfo(basicInfo);
    }

    updateEtunimi(event: React.ChangeEvent<HTMLInputElement>) {
        const { basicInfo } = this.props;
        basicInfo.etunimi = event.target.value;
        this.props.setBasicInfo(basicInfo);
    }

    updateSukunimi(event: React.ChangeEvent<HTMLInputElement>) {
        const { basicInfo } = this.props;
        basicInfo.sukunimi = event.target.value;
        this.props.setBasicInfo(basicInfo);
    }

    selectLanguage(selection: SelectOption) {
        const { basicInfo } = this.props;
        basicInfo.languageCode = selection.value;
        this.props.setBasicInfo(basicInfo);
    }

    updateSaate(event: React.ChangeEvent<HTMLInputElement>) {
        const { basicInfo } = this.props;
        basicInfo.saate = event.target.value;
        this.props.setBasicInfo(basicInfo);
    }
}
