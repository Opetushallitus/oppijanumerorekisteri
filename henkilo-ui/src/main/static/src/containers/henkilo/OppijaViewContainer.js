import React from 'react'
import {connect} from 'react-redux';
import OppijaViewPage from "../../components/henkilo/OppijaViewPage";
import {
    fetchHenkilo, passivoiHenkilo, updateHenkiloAndRefetch, updateKayttajatieto,
    updatePassword, yksiloiHenkilo
} from "../../actions/henkilo.actions";
import {
    fetchKansalaisuusKoodisto, fetchKieliKoodisto,
    fetchYhteystietotyypitKoodisto
} from "../../actions/koodisto.actions";
import {updateNavigation} from "../../actions/navigation.actions";
import {oppijaNavi} from "../../configuration/navigationconfigurations";
import dateformat from 'dateformat';
import Button from "../../components/common/button/Button";
import locale from '../../configuration/locale'
import ConfirmButton from "../../components/common/button/ConfirmButton";

const OppijaViewContainer = React.createClass({
    componentDidMount: function() {
        this.props.updateNavigation(oppijaNavi(this.props.oid), '/henkilo');

        this.props.fetchHenkilo(this.props.oid);
        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
    },
    render: function() {
        const props = {...this.props, L: this.L, locale: locale, _isUserContentLoading: this._isUserContentLoading,
            _isContactContentLoading: this._isContactContentLoading, _createBasicInfo: this._createBasicInfo,
            _createBasicInfo2: this._createBasicInfo2, _createLoginInfo: this._createLoginInfo,
            _readOnlyButtons: this._readOnlyButtons, _editButtons: this._editButtons,
            _creatableYhteystietotyypit: this._creatableYhteystietotyypit, };
        return <OppijaViewPage {...props} />;
    },
    getInitialState: function () {
        this.L = this.props.l10n[locale];
        this._isUserContentLoading = () => this.props.henkilo.henkiloLoading || this.props.koodisto.kieliKoodistoLoading
        || this.props.koodisto.kansalaisuusKoodistoLoading;
        this._isContactContentLoading = () => this.props.henkilo.henkiloLoading || this.props.koodisto.yhteystietotyypitKoodistoLoading;

        this._createBasicInfo = () => [
            {label: 'HENKILO_SUKUNIMI', value: this.props.henkilo.henkilo.sukunimi, inputValue: 'sukunimi', autoFocus: true},
            {label: 'HENKILO_ETUNIMET', value: this.props.henkilo.henkilo.etunimet, inputValue: 'etunimet'},
            {label: 'HENKILO_SYNTYMAAIKA', inputValue: 'syntymaaika', date: true,
                value: dateformat(new Date(this.props.henkilo.henkilo.syntymaaika), this.L['PVM_FORMAATTI']), },
            {label: 'HENKILO_HETU', value: this.props.henkilo.henkilo.hetu, inputValue: 'hetu'},
            {label: 'HENKILO_KUTSUMANIMI', value: this.props.henkilo.henkilo.kutsumanimi, inputValue: 'kutsumanimi'},
        ];

        this._createBasicInfo2 = () => ([
            this.props.henkilo.henkilo.kansalaisuus && this.props.henkilo.henkilo.kansalaisuus.length
                ? this.props.henkilo.henkilo.kansalaisuus.map((values, idx) =>
                ({
                    label: 'HENKILO_KANSALAISUUS',
                    data: this.props.koodisto.kansalaisuus.map(koodi => ({id: koodi.value, text: koodi[locale]})),
                    value: this.props.koodisto.kansalaisuus.filter(kansalaisuus =>
                    kansalaisuus.value === values.kansalaisuusKoodi)[0][locale],
                    inputValue: 'kansalaisuus.' + idx + '.kansalaisuusKoodi',
                    selectValue: values.kansalaisuusKoodi
                })).reduce((a,b) => a.concat(b))
                : { label: 'HENKILO_KANSALAISUUS',
                data: this.props.koodisto.kansalaisuus.map(koodi => ({id: koodi.value, text: koodi[locale]})),
                inputValue: 'kansalaisuus.0.kansalaisuusKoodi',
                value: null },
            {label: 'HENKILO_AIDINKIELI',
                data: this.props.koodisto.kieli.map(koodi => ({id: koodi.value, text: koodi[locale]})),
                inputValue: 'aidinkieli.kieliKoodi',
                value: this.props.henkilo.henkilo.aidinkieli && this.props.koodisto.kieli.filter(kieli =>
                kieli.value === this.props.henkilo.henkilo.aidinkieli.kieliKoodi)[0][locale],
                selectValue: this.props.henkilo.henkilo.aidinkieli && this.props.henkilo.henkilo.aidinkieli.kieliKoodi},
            {label: 'HENKILO_OPPIJANUMERO', value: this.props.henkilo.henkilo.oidHenkilo, inputValue: 'oidHenkilo', readOnly: true,},
            {label: 'HENKILO_ASIOINTIKIELI',
                data: this.props.koodisto.kieli.map(koodi => ({id: koodi.value, text: koodi[locale]})),
                inputValue: 'asiointiKieli.kieliKoodi',
                value: this.props.henkilo.henkilo.asiointiKieli && this.props.koodisto.kieli.filter(kieli =>
                kieli.value === this.props.henkilo.henkilo.asiointiKieli.kieliKoodi)[0][locale],
                selectValue: this.props.henkilo.henkilo.asiointiKieli && this.props.henkilo.henkilo.asiointiKieli.kieliKoodi},
        ]);
        this._createLoginInfo = () => [];
        this._readOnlyButtons = (edit) => [
            <Button key="edit" big action={edit}>{this.L['MUOKKAA_LINKKI']}</Button>,
            <ConfirmButton key="yksilointi" big action={() => this.props.yksiloiHenkilo(this.props.henkilo.henkilo.oidHenkilo)}
                           normalLabel={this.L['YKSILOI_LINKKI']} confirmLabel={this.L['YKSILOI_LINKKI_CONFIRM']}/>,
            this.props.henkilo.henkilo.passivoitu
                ? <Button key="passivoi" big disabled action={() => {}}>{this.L['PASSIVOI_PASSIVOITU']}</Button>
                : <ConfirmButton key="passivoi" big action={() => this.props.passivoiHenkilo(this.props.henkilo.henkilo.oidHenkilo)}
                                 normalLabel={this.L['PASSIVOI_LINKKI']} confirmLabel={this.L['PASSIVOI_LINKKI_CONFIRM']} />,
        ];
        this._editButtons = (discard, update) => [
            <Button key="discard" big cancel action={discard}>{this.L['PERUUTA_LINKKI']}</Button>,
            <Button key="update" big action={update}>{this.L['TALLENNA_LINKKI']}</Button>
        ];
        this._creatableYhteystietotyypit = () => this.props.koodisto.yhteystietotyypit
            .filter(yhteystietotyyppi => ['yhteystietotyyppi4', 'yhteystietotyyppi10', 'yhteystietotyyppi5', 'yhteystietotyyppi9',
            'yhteystietotyyppi12', 'yhteystietotyyppi18', 'yhteystietotyyppi11', 'yhteystietotyyppi8'].indexOf(yhteystietotyyppi.value) === -1);
        return {
            confirmPassivointi: false,
        }
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

export default connect(mapStateToProps, {fetchHenkilo, fetchYhteystietotyypitKoodisto, fetchKieliKoodisto,
fetchKansalaisuusKoodisto, updateHenkiloAndRefetch, updatePassword, passivoiHenkilo,
    yksiloiHenkilo, updateKayttajatieto, updateNavigation})(OppijaViewContainer)