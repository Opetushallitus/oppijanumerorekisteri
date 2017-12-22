// @flow
import VirkailijaDuplikaatitPage from './DuplikaatitPage';
import React from 'react';
import * as R from 'ramda';
import {connect} from 'react-redux';
import {fetchHenkilo, fetchHenkiloDuplicates, fetchHenkiloMaster, linkHenkilos} from '../../../actions/henkilo.actions';
import {fetchOmattiedot} from '../../../actions/omattiedot.actions';
import {fetchKansalaisuusKoodisto,
        fetchMaatJaValtiotKoodisto,
        fetchKieliKoodisto} from '../../../actions/koodisto.actions';
import {updateHenkiloNavigation} from "../../../actions/navigation.actions";
import {removeNotification} from "../../../actions/notifications.actions";
import {henkiloViewTabs} from "../../navigation/NavigationTabs";
import type {HenkiloState} from "../../../reducers/henkilo.reducer";
import type {L10n} from "../../../types/localisation.type";
import type {Locale} from "../../../types/locale.type";

type Props = {
    l10n: L10n,
    locale: Locale,
    oidHenkilo: string,
    henkilo: HenkiloState,
    henkiloType: string,
    fetchHenkilo: string => void,
    fetchOmattiedot: () => void,
    fetchHenkiloMaster: string => void,
    fetchHenkiloDuplicates: string => void,
    fetchMaatJaValtiotKoodisto: () => void,
    fetchKansalaisuusKoodisto: () => void,
    fetchKieliKoodisto: () => void,
    updateHenkiloNavigation: (Array<{}>) => void,
}

class VirkailijaDuplikaatitContainer extends React.Component<Props> {

    componentDidMount() {
        this.props.fetchHenkilo(this.props.oidHenkilo);
        this.props.fetchOmattiedot();
        this.props.fetchHenkiloMaster(this.props.oidHenkilo);
        this.props.fetchHenkiloDuplicates(this.props.oidHenkilo);
        this.props.fetchKansalaisuusKoodisto();
        this.props.fetchMaatJaValtiotKoodisto();
        this.props.fetchKieliKoodisto();
        this.props.updateHenkiloNavigation(henkiloViewTabs(this.props.oidHenkilo, this.props.henkilo, this.props.henkiloType));
    }

    render() {
        return <VirkailijaDuplikaatitPage {...this.props} />
    }

}

const codeLabel = (koodi, koodisto, locale) => {
    const k = R.find(item => item.value === koodi, koodisto);
    if (k) {
        return k[locale];
    } else {
        return null;
    }
}

const fromHakuAppApplication = (a, locale, koodisto) => {
    const kansalaisuusKoodi = (a.answers.henkilotiedot.kansalaisuus || "").toLowerCase();
    const aidinkieliKoodi = (a.answers.henkilotiedot.aidinkieli || "").toLowerCase();
    const kansalaisuus = codeLabel(kansalaisuusKoodi, koodisto.maatjavaltiot1, locale);
    const aidinkieli = codeLabel(aidinkieliKoodi, koodisto.kieli, locale);
    return {
        oid: a.oid,
        kansalaisuus: kansalaisuus,
        aidinkieli: aidinkieli,
        matkapuhelinnumero: a.answers.henkilotiedot.matkapuhelinnumero1,
        sahkoposti: a.answers.henkilotiedot['Sähköposti'],
        lahiosoite: a.answers.henkilotiedot.lahiosoite,
        postinumero: a.answers.henkilotiedot.Postinumero,
        passinumero: a.answers.henkilotiedot.passinumero,
        kansallinenIdTunnus: a.answers.henkilotiedot.kansallinenIdTunnus,
        state: a.state,
        href: `/haku-app/virkailija/hakemus/${a.oid}`
    };
};

const fromAtaruApplication = (a, locale, koodisto) => {
    const kansalaisuusKoodi = a.kansalaisuus.toLowerCase();
    const aidinkieliKoodi = a.aidinkieli.toLowerCase();
    const kansalaisuus = codeLabel(kansalaisuusKoodi, koodisto.kansalaisuus, locale);
    const aidinkieli = codeLabel(aidinkieliKoodi, koodisto.kieli, locale);
    const href = a.haku ?
          `/lomake-editori/applications/haku/${a.haku}?application-key=${a.oid}` :
          `/lomake-editori/applications/${a.form}?application-key=${a.oid}`;
    return {
        oid: a.oid,
        kansalaisuus: kansalaisuus,
        aidinkieli: aidinkieli,
        matkapuhelinnumero: a.matkapuhelin,
        sahkoposti: a.email,
        lahiosoite: a.lahiosoite,
        postinumero: a.postinumero,
        passinumero: a.passinNumero,
        kansallinenIdTunnus: a.idTunnus,
        state: null,
        href: href
    };
};

const concatApplications = (henkilo, ataruApplications, locale, koodisto) => {
    const hs = (henkilo.hakemukset || [])
          .map((a) => fromHakuAppApplication(a, locale, koodisto));
    const as = (ataruApplications[henkilo.oidHenkilo] || [])
          .map((a) => fromAtaruApplication(a, locale, koodisto));
    return Object.assign({}, henkilo, {hakemukset: hs.concat(as)});
}

const mapStateToProps = (state, ownProps) => {
    return {
        oidHenkilo: ownProps.params['oid'],
        henkiloType: ownProps.params['henkiloType'],
        l10n: state.l10n.localisations,
        locale: state.locale,
        henkilo: Object.assign({}, state.henkilo, {
            henkilo: concatApplications(
                state.henkilo.henkilo,
                state.henkilo.ataruApplications,
                state.locale,
                state.koodisto
            ),
            duplicates: state.henkilo.duplicates.map((duplicate) => concatApplications(
                duplicate,
                state.henkilo.ataruApplications,
                state.locale,
                state.koodisto
            ))
        }),
        koodisto: state.koodisto,
        notifications: state.notifications.duplicatesNotifications,
    };
};

export default connect(mapStateToProps, {
    fetchHenkilo,
    fetchOmattiedot,
    fetchHenkiloDuplicates,
    fetchHenkiloMaster,
    fetchKansalaisuusKoodisto,
    fetchMaatJaValtiotKoodisto,
    fetchKieliKoodisto,
    linkHenkilos,
    updateHenkiloNavigation,
    removeNotification
})(VirkailijaDuplikaatitContainer);
