import React from 'react'
import {connect} from 'react-redux';
import VirkailijaViewPage from "../../components/henkilo/VirkailijaViewPage";
import {
    fetchHenkilo, fetchHenkiloOrgs, fetchKayttajatieto, passivoiHenkilo, updateHenkiloAndRefetch, updateKayttajatieto,
    updatePassword, yksiloiHenkilo
} from "../../actions/henkilo.actions";
import {
    fetchKansalaisuusKoodisto, fetchKieliKoodisto, fetchSukupuoliKoodisto,
    fetchYhteystietotyypitKoodisto
} from "../../actions/koodisto.actions";
import {updateNavigation} from "../../actions/navigation.actions";
import {virkailijaNavi} from "../../configuration/navigationconfigurations";
import Button from "../../components/common/button/Button";
import locale from '../../configuration/locale'
import ConfirmButton from "../../components/common/button/ConfirmButton";


const VirkailijaViewContainer = React.createClass({
    componentDidMount: function() {
        this.props.updateNavigation(virkailijaNavi(this.props.oid), '/henkilo');

        this.props.fetchHenkilo(this.props.oid);
        this.props.fetchHenkiloOrgs(this.props.oid);
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
        this.props.fetchSukupuoliKoodisto();
        this.props.fetchKayttajatieto(this.props.oid);
    },
    render: function() {
        const props = {...this.props, L: this.L, locale: locale, isUserContentLoading: this._isUserContentLoading,
            isOrganisationContentLoading: this._isOrganisationContentLoading, createBasicInfo: this._createBasicInfo,
            createBasicInfo2: this._createBasicInfo2, createLoginInfo: this._createLoginInfo, readOnlyButtons: this._readOnlyButtons,
            editButtons: this._editButtons, createNotifications: this._createNotifications, };
        return <VirkailijaViewPage {...props} />;
    },
    getInitialState: function () {
        this.L = this.props.l10n[locale];
        this._isUserContentLoading = () => this.props.henkilo.henkiloLoading || this.props.koodisto.kieliKoodistoLoading
        || this.props.koodisto.kansalaisuusKoodistoLoading || this.props.koodisto.sukupuoliKoodistoLoading
        || this.props.henkilo.kayttajatietoLoading;
        this._isOrganisationContentLoading = () => this.props.henkilo.henkiloOrgsLoading;

        this._createBasicInfo = () => [
            {
                label: 'HENKILO_SUKUNIMI',
                value: this.props.henkilo.henkilo.sukunimi,
                inputValue: 'sukunimi',
                autoFocus: true
            },
            {label: 'HENKILO_ETUNIMET', value: this.props.henkilo.henkilo.etunimet, inputValue: 'etunimet'},
            {label: 'HENKILO_KUTSUMANIMI', value: this.props.henkilo.henkilo.kutsumanimi, inputValue: 'kutsumanimi'},
            {
                label: 'HENKILO_ASIOINTIKIELI',
                data: this.props.koodisto.kieli.map(koodi => ({id: koodi.value, text: koodi[locale]})),
                inputValue: 'asiointiKieli.kieliKoodi',
                value: this.props.henkilo.henkilo.asiointiKieli && this.props.koodisto.kieli.filter(kieli =>
                kieli.value === this.props.henkilo.henkilo.asiointiKieli.kieliKoodi)[0][locale],
                selectValue: this.props.henkilo.henkilo.asiointiKieli && this.props.henkilo.henkilo.asiointiKieli.kieliKoodi
            },
        ];
        this._createBasicInfo2 = () => ([
            {
                label: 'HENKILO_OPPIJANUMERO',
                value: this.props.henkilo.henkilo.oidHenkilo,
                inputValue: 'oidHenkilo',
                readOnly: true,
            },
        ]);
        this._createLoginInfo = () => [{
            label: 'HENKILO_KAYTTAJANIMI',
            value: this.props.henkilo.kayttajatieto.username,
            inputValue: 'kayttajanimi'},
        ];
        this._readOnlyButtons = (edit) => [
            <Button key="edit" big action={edit}>{this.L['MUOKKAA_LINKKI']}</Button>,
            this.props.henkilo.henkilo.passivoitu
                ? <Button key="passivoi" big disabled action={() => {
            }}>{this.L['PASSIVOI_PASSIVOITU']}</Button>
                : <ConfirmButton key="passivoi" big
                                 action={() => this.props.passivoiHenkilo(this.props.henkilo.henkilo.oidHenkilo)}
                                 normalLabel={this.L['PASSIVOI_LINKKI']}
                                 confirmLabel={this.L['PASSIVOI_LINKKI_CONFIRM']}
                                 errorMessage={this._createPopupErrorMessage('passivoi')}/>,
            <Button key="haka" big action={() => {}}>{this.L['LISAA_HAKA_LINKKI']}</Button>,
            <Button key="password" big action={() => {}}>{this.L['SALASANA_ASETA']}</Button>,
        ];
        this._editButtons = (discard, update) => [
            <Button key="discard" big cancel action={discard}>{this.L['PERUUTA_LINKKI']}</Button>,
            <Button key="update" big action={update}>{this.L['TALLENNA_LINKKI']}</Button>
        ];
        this._createNotifications = (position) => this.props.henkilo.notifications.filter(notification => notification.position === position)
            .map((notification, idx) => <div key={idx}>{this.L[notification.notL10nMessage]}</div>);
        this._createPopupErrorMessage = (notificationKey) => {
            const notification = this.props.henkilo.buttonNotifications[notificationKey];
            return {
                errorTopic: notification && this.L[notification.notL10nMessage],
                errorText: notification && this.L[notification.notL10nText]
            };
        };
        return {};
    },
});

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname,
        oid: ownProps.params['oid'],
        henkilo: state.henkilo,
        l10n: state.l10n.localisations,
        koodisto: state.koodisto,
    };
};

export default connect(mapStateToProps, {fetchHenkilo, fetchHenkiloOrgs, fetchKieliKoodisto,
fetchKansalaisuusKoodisto, fetchSukupuoliKoodisto, updateHenkiloAndRefetch, fetchKayttajatieto, updatePassword, passivoiHenkilo,
    yksiloiHenkilo, updateKayttajatieto, updateNavigation})(VirkailijaViewContainer);
