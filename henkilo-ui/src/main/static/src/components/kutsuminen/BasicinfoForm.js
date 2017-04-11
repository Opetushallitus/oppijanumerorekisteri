import React from 'react'
import Select2 from '../common/select/Select2';
import languages from '../../configuration/languages';
import locale from '../../configuration/locale';
import './BasicinfoForm.css';

export class BasicInfo extends React.Component {

    render() {
        const L = this.props.l10n[locale];
        const {basicInfo} = this.props;

        return (
            <fieldset id="basicinfo">
                <h2>{L['VIRKAILIJAN_TIEDOT_OTSIKKO']}</h2>
                <div className="oph-field oph-field-inline">
                    <label htmlFor="etunimi" className="required oph-label">{L['VIRKAILIJAN_TIEDOT_ETUNIMI']}</label>
                    <input type="text" id="etunimi" className="oph-input" aria-required="true" value={basicInfo.etunimi || ''}
                           onChange={this.updateEtunimi.bind(this)}/>
                </div>
                <div className="oph-field oph-field-inline">
                    <label htmlFor="sukunimi" className="required oph-label">{L['VIRKAILIJAN_TIEDOT_SUKUNIMI']}</label>
                    <input type="text" id="sukunimi" className="oph-input" aria-required="true" value={basicInfo.sukunimi || ''}
                           onChange={this.updateSukunimi.bind(this)}/>
                </div>
                <div className="oph-field oph-field-inline">
                    <label htmlFor="email" className="required oph-label">{L['VIRKAILIJAN_TIEDOT_SPOSTI']}</label>
                    <input type="text" id="email" className="oph-input" aria-required="true" value={basicInfo.email} onChange={this.updateEmail.bind(this)}/>
                </div>
                <div className="oph-field oph-field-inline">
                    <label className="oph-label" htmlFor="lang">{L['VIRKAILIJAN_TIEDOT_ASIOINTIKIELI']}</label>
                    <div className="fieldContainer">
                        <Select2 id="lang"
                                 data={languages.map(language => ({id: language.code, text: language.name[locale]}))}
                                 onSelect={this.selectLanguage.bind(this)}
                                 value={basicInfo.languageCode}>
                            {languages.map(this.renderLang.bind(this))}
                        </Select2>
                        <div className="oph-field-text">
                            {L['VIRKAILIJAN_LISAYS_ASIOINTIKIELI_TARKENNE']}
                        </div>
                    </div>
                </div>
            </fieldset>
        )
    }

    renderLang(lang) {
        return (
            <option key={lang.code} value={lang.code}>{lang.name[locale]}</option>
        )
    }

    updateEmail(event) {
        const { basicInfo } = this.props;
        basicInfo.email = event.target.value;
        this.props.setBasicInfo(basicInfo);
    }

    updateEtunimi(event) {
        const { basicInfo } = this.props;
        basicInfo.etunimi = event.target.value;
        this.props.setBasicInfo(basicInfo);
    }

    updateSukunimi(event) {
        const { basicInfo } = this.props;
        basicInfo.sukunimi = event.target.value;
        this.props.setBasicInfo(basicInfo);
    }

    selectLanguage(event) {
        const { basicInfo } = this.props;
        basicInfo.languageCode = event.target.value;
        this.props.setBasicInfo(basicInfo);
    }
}

BasicInfo.propTypes = {
    basicInfo: React.PropTypes.object,
    l10n: React.PropTypes.object,
    setBasicInfo: React.PropTypes.func
};
