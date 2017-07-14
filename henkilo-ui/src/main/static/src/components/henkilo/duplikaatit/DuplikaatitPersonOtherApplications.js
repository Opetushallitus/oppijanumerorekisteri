import React from 'react';
import PropTypes from 'prop-types'
import R from 'ramda';
import './DuplikaatitPersonOtherApplications.css';

export default class DuplikaatitPersonOtherApplications extends React.Component {

    static propTypes = {
        hakemukset: PropTypes.array,
        koodisto: PropTypes.object,
        locale: PropTypes.string,
        styleClasses: PropTypes.string,
        L: PropTypes.object
    };

    render() {
        
        return <div>
            {this.props.hakemukset.map(hakemus => {
                const secondaryInformation = this._parseContactInformation(this.props.locale, hakemus, this.props.koodisto);
                return <div className="application" key={hakemus.oid}>
                    <span>{secondaryInformation.kansalaisuus}</span>
                    <span>{secondaryInformation.aidinkieli}</span>
                    <span>{secondaryInformation.matkapuhelinnumero}</span>
                    <span>{secondaryInformation.sahkoposti}</span>
                    <span>{secondaryInformation.lahiosoite}</span>
                    <span>{secondaryInformation.postinumero}</span>
                    <span>{secondaryInformation.passinumero}</span>
                    <span>{secondaryInformation.kansallinenIdTunnus}</span>
                    <span>{hakemus ? hakemus.state : ''}</span>
                    <span>{hakemus ? <a className="oph-link" href={`/haku-app/virkailija/hakemus/${hakemus.oid}`}>{hakemus.oid}</a> : ''}</span>
                </div>
            })}
        </div>
    }


    _parseContactInformation(locale, hakemus, koodisto) {
        const henkilotiedot = hakemus.answers.henkilotiedot;
        const kansalaisuusLowercase = henkilotiedot.kansalaisuus ? henkilotiedot.kansalaisuus.toLowerCase() : undefined;
        const maatjavaltioKoodisto = R.find(item => item.value === kansalaisuusLowercase, koodisto.maatjavaltiot1);
        const kansalaisuus = maatjavaltioKoodisto[locale];
        const aidinkieliLowercase = henkilotiedot.aidinkieli ? henkilotiedot.aidinkieli.toLowerCase() : undefined;
        const aidinkieliKoodisto = R.find(item => item.value === aidinkieliLowercase, koodisto.kieli);
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