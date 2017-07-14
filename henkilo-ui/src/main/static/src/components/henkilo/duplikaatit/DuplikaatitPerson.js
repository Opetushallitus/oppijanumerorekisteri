import React from 'react';
import PropTypes from 'prop-types'
import {Link} from 'react-router';
import R from 'ramda';
import classNames from 'classnames';
import './DuplikaatitPerson.css';
import DuplikaatitApplicationsPopup from './DuplikaatitApplicationsPopup';
import DuplikaatitPersonOtherApplications from './DuplikaatitPersonOtherApplications';

export default class DuplikaatitPrimaryInformation extends React.Component {

    static propTypes = {
        henkilo: PropTypes.object.isRequired,
        L: PropTypes.object.isRequired,
        locale: PropTypes.string.isRequired,
        koodisto: PropTypes.object.isRequired,
        setSelection: PropTypes.func.isRequired,
        classNames: PropTypes.object,
        isMaster: PropTypes.bool,
        header: PropTypes.string.isRequired,
        styleClasses: PropTypes.string
    };

    componentWillMount() {
        this.setState({checkboxValue: this.props.isMaster})
    }

    render() {
        const henkilo = this.props.henkilo;
        const hakemus = henkilo.hakemukset ? R.head(henkilo.hakemukset) : null;
        const muutHakemukset = henkilo.hakemukset ? R.tail(henkilo.hakemukset) : [];
        const locale = this.props.locale;
        const contactInformation = hakemus ? this._parseContactInformation(locale, hakemus, this.props.koodisto) : {} ;
        const styleClasses = classNames(this.props.classNames);
        const L = this.props.L;

        return <div className={styleClasses}>
            <span className="type">{L[this.props.header]}</span>
            <span>{henkilo.hetu}</span>
            <span>{(henkilo.yksiloity || henkilo.yksiloityVTJ) ? L['HENKILO_YHTEISET_KYLLA'] : L['HENKILO_YHTEISET_EI']}</span>
            <span>{henkilo.kutsumanimi}</span>
            <span>{henkilo.etunimet}</span>
            <span>{henkilo.sukunimi}</span>
            <span>{henkilo.sukupuoli === '2' ? L['HENKILO_YHTEISET_NAINEN'] : L['HENKILO_YHTEISET_MIES']}</span>
            <span>{henkilo.syntymaaika}</span>
            <span><Link className="oph-link" to={`/virkailija/${henkilo.oidHenkilo}`}>{henkilo.oidHenkilo}</Link></span>
            <span>{contactInformation.kansalaisuus}</span>
            <span>{contactInformation.aidinkieli}</span>
            <span>{contactInformation.matkapuhelinnumero}</span>
            <span>{contactInformation.sahkoposti}</span>
            <span>{contactInformation.lahiosoite}</span>
            <span>{contactInformation.postinumero}</span>
            <span>{contactInformation.passinumero}</span>
            <span>{contactInformation.kansallinenIdTunnus}</span>
            <span>{hakemus ? hakemus.state : ''}</span>
            <span>{hakemus ? <a className="oph-link" href={`/haku-app/virkailija/hakemus/${hakemus.oid}`}>{hakemus.oid}</a> : ''}</span>
            <span>{muutHakemukset.length > 0 ? <DuplikaatitApplicationsPopup
                        popupContent={<DuplikaatitPersonOtherApplications
                        hakemukset={muutHakemukset}
                        koodisto={this.props.koodisto}
                        locale={this.props.locale}
                        L={this.props.L}
                    ></DuplikaatitPersonOtherApplications>}>
                    {L['DUPLIKAATIT_MUUTHAKEMUKSET']}
                </DuplikaatitApplicationsPopup> : null}</span>
            <span><input type="checkbox" disabled={this.props.isMaster} checked={this.state.checkboxValue}
                         onChange={this._onCheck.bind(this, henkilo.oidHenkilo)}/></span>
        </div>;
    }

    _onCheck(oid) {
        this.setState({
            checkboxValue: !this.state.checkboxValue
        });
        this.props.setSelection(oid);
    }

    _parseContactInformation(locale, hakemus, koodisto) {
        const henkilotiedot = hakemus.answers.henkilotiedot;
        const kansalaisuusLowercase = henkilotiedot.kansalaisuus ? henkilotiedot.kansalaisuus.toLowerCase() : undefined;
        const maatjavaltioKoodisto = R.find( item => item.value === kansalaisuusLowercase, koodisto.maatjavaltiot1);
        const kansalaisuus = maatjavaltioKoodisto[locale];
        const aidinkieliLowercase = henkilotiedot.aidinkieli ? henkilotiedot.aidinkieli.toLowerCase() : undefined;
        const aidinkieliKoodisto = R.find( item => item.value === aidinkieliLowercase, koodisto.kieli);
        const aidinkieli = aidinkieliKoodisto[locale];

        return {
            matkapuhelinnumero: henkilotiedot.matkapuhelinnumero1,
            sahkoposti: henkilotiedot['Sähköposti'],
            lahiosoite: henkilotiedot.lahiosoite,
            postinumero: henkilotiedot.Postinumero,
            passinumero: henkilotiedot.passinumero,
            kansallinenIdTunnus: henkilotiedot.kansallinenIdTunnus,
            kansalaisuus,
            aidinkieli

        }
    }



}

