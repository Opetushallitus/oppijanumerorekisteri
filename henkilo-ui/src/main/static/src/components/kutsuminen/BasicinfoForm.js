import React from 'react'
import PropTypes from 'prop-types'
import languages from '../../configuration/languages';
import './BasicinfoForm.css';
import OphSelect from '../common/select/OphSelect';

export class BasicInfo extends React.Component {

    static propTypes = {
        basicInfo: PropTypes.object,
        l10n: PropTypes.object,
        setBasicInfo: PropTypes.func,
        locale: PropTypes.string
    };

    render() {
        const L = this.props.l10n[this.props.locale];
        const {basicInfo} = this.props;

        const languageOptions = languages.map( language => ({ value: language.code, label: language.name[this.props.locale] }));
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
                        <OphSelect name="languageSelection"
                                   value={basicInfo.languageCode}
                                   options={languageOptions}
                                   onChange={this.selectLanguage.bind(this)}/>

                        <div className="oph-field-text">
                            {L['VIRKAILIJAN_LISAYS_ASIOINTIKIELI_TARKENNE']}
                        </div>
                    </div>
                </div>
            </fieldset>
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

    selectLanguage(selection) {
        const { basicInfo } = this.props;
        basicInfo.languageCode = selection.value;
        this.props.setBasicInfo(basicInfo);
    }
}

