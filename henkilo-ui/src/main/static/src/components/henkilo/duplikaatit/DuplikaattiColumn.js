
import React from 'react';
import R from 'ramda';
import classNames from 'classnames';
import './DuplikaattiColumn.css';

export default class DuplikaattiColumn extends React.Component {

    static propTypes = {
        henkilo: React.PropTypes.object.isRequired,
        L: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,
        koodisto: React.PropTypes.object.isRequired,
        setSelection: React.PropTypes.func.isRequired,
        classNames: React.PropTypes.object
    };

    render() {
        const henkilo = this.props.henkilo;
        const hakemus = henkilo.hakemukset ? R.head(henkilo.hakemukset) : null;
        const muutHakemukset = henkilo.hakemukset ? R.tail(henkilo.hakemukset) : null;
        const locale = this.props.locale;
        const contactInformation = hakemus ? this._parseContactInformation(locale, hakemus, this.props.koodisto) : {} ;
        const styleClasses = classNames(this.props.classNames);
        const L = this.props.L;
        return <div className={styleClasses}>
            <span className="type">{L['DUPLIKAATIT_DUPLIKAATTI']}</span>
            <span>{henkilo.hetu}</span>
            <span>{henkilo.yksiloity ? L['HENKILO_YHTEISET_KYLLA'] : L['HENKILO_YHTEISET_EI']}</span>
            <span>{henkilo.kutsumanimi}</span>
            <span>{henkilo.etunimet}</span>
            <span>{henkilo.sukunimi}</span>
            <span>{henkilo.sukupuoli === '2' ? L['HENKILO_YHTEISET_NAINEN'] : L['HENKILO_YHTEISET_MIES']}</span>
            <span>{henkilo.syntymaaika}</span>
            <span>{henkilo.oidHenkilo}</span>
            <span>{contactInformation.kansalaisuus}</span>
            <span>{contactInformation.aidinkieli}</span>
            <span>{contactInformation.matkapuhelinnumero}</span>
            <span>{contactInformation.sahkoposti}</span>
            <span>{contactInformation.lahiosoite}</span>
            <span>{contactInformation.postinumero}</span>
            <span>{contactInformation.passinumero}</span>
            <span>{contactInformation.kansallinenIdTunnus}</span>
            <span>{hakemus ? L[`DUPLIKAATIT_STATE_${hakemus.state}`] : ''}</span>
            <span>{hakemus ? hakemus.oid : ''}</span>
            <span>{muutHakemukset}</span>
            <span><input type="checkbox" onChange={() => this.props.setSelection(henkilo.oidHenkilo)}/></span>
        </div>;
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

