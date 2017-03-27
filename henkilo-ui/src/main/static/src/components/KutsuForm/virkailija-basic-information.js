import React from 'react'
import Select2 from '../common/select/Select2';
import languages from '../../configuration/languages';
import locale from '../../configuration/locale';

export class VirkailijaBasicInformation extends React.Component {

    constructor(props) {
        super();
        const {basicInfo} = props;

        this.state = {
            basicInfo: basicInfo
        }
    }

    componentDidMount() {
        // basicInfo.setLanguage(this.props.languages[0].code)
    }

    render() {
        const L = this.props.l10n['fi'];
        const {basicInfo} = this.state;
        return (
            <fieldset className="basic-info">
                <h2>{L['VIRKAILIJAN_TIEDOT_OTSIKKO']}</h2>
                <div className="row">
                    <label htmlFor="etunimi" className="required">{L['VIRKAILIJAN_TIEDOT_ETUNIMI']}</label>
                    <input type="text" id="etunimi" value={basicInfo.etunimi || ''}
                           onChange={this.handleEtunimi.bind(this)}/>
                </div>
                <div className="row">
                    <label htmlFor="sukunimi" className="required">{L['VIRKAILIJAN_TIEDOT_SUKUNIMI']}</label>
                    <input type="text" id="sukunimi" value={basicInfo.sukunimi || ''}
                           onChange={this.handleSukunimi.bind(this)}/>
                </div>
                <div className="row">
                    <label htmlFor="email" className="required">{L['VIRKAILIJAN_TIEDOT_SPOSTI']}</label>
                    <input type="text" id="email" value={basicInfo.email || ''} onChange={this.handleEmail.bind(this)}/>
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
            <option key={lang.code} value={lang.code}>{lang.name[this.props.locale]}</option>
        )
    }

    handleEmail(event) {
        const basicInfo = this.state.basicInfo;
        basicInfo.email = event.target.value;
        this.setState({basicInfo});
    }

    handleEtunimi(event) {
        const basicInfo = this.state.basicInfo;
        basicInfo.etunimi = event.target.value;
        this.setState({basicInfo});
    }

    handleSukunimi(event) {
        const basicInfo = this.state.basicInfo;
        basicInfo.sukunimi = event.target.value;
        this.setState({basicInfo});
    }

    selectLanguage(event) {
        const basicInfo = this.state.basicInfo;
        basicInfo.languageCode = event.target.value;
        this.setState({basicInfo});
    }
}