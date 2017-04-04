import React from 'react'
import Select2 from '../common/select/Select2';
import languages from '../../configuration/languages';
import locale from '../../configuration/locale';

export class VirkailijaBasicInformation extends React.Component {

    render() {
        const L = this.props.l10n[locale];
        const {basicInfo} = this.props;

        return (
            <fieldset className="basic-info">
                <h2>{L['VIRKAILIJAN_TIEDOT_OTSIKKO']}</h2>
                <div className="row">
                    <label htmlFor="etunimi" className="required">{L['VIRKAILIJAN_TIEDOT_ETUNIMI']}</label>
                    <input type="text" id="etunimi" value={basicInfo.etunimi || ''}
                           onChange={this.updateEtunimi.bind(this)}/>
                </div>
                <div className="row">
                    <label htmlFor="sukunimi" className="required">{L['VIRKAILIJAN_TIEDOT_SUKUNIMI']}</label>
                    <input type="text" id="sukunimi" value={basicInfo.sukunimi || ''}
                           onChange={this.updateSukunimi.bind(this)}/>
                </div>
                <div className="row">
                    <label htmlFor="email" className="required">{L['VIRKAILIJAN_TIEDOT_SPOSTI']}</label>
                    <input type="text" id="email" value={basicInfo.email} onChange={this.updateEmail.bind(this)}/>
                </div>
                <div className="row select-row">
                    <label htmlFor="lang">{L['VIRKAILIJAN_TIEDOT_ASIOINTIKIELI']}</label>
                    <div className="fieldContainer">
                        <Select2 id="lang"
                                 data={languages.map(language => ({id: language.code, text: language.name[locale]}))}
                                 onSelect={this.selectLanguage.bind(this)}
                                 value={basicInfo.languageCode}>
                            {languages.map(this.renderLang.bind(this))}
                        </Select2>
                        <div className="descriptionBelow">
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

VirkailijaBasicInformation.propTypes = {
    basicInfo: React.PropTypes.object,
    l10n: React.PropTypes.object,
    setBasicInfo: React.PropTypes.func
};