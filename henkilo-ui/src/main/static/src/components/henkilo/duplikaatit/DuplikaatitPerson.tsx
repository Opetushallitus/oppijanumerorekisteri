import React from 'react';
import { Link } from 'react-router';
import * as R from 'ramda';
import classNames from 'classnames';
import './DuplikaatitPerson.css';
import DuplikaatitApplicationsPopup from './DuplikaatitApplicationsPopup';
import DuplikaatitPersonOtherApplications from './DuplikaatitPersonOtherApplications';
import { Localisations } from '../../../types/localisation.type';
import { Locale } from '../../../types/locale.type';
import { KoodistoState } from '../../../reducers/koodisto.reducer';
import { DuplikaatitHakemus } from '../../../types/duplikaatithakemus.types';
import { Hakemus } from '../../../types/domain/oppijanumerorekisteri/Hakemus.type';

type Props = {
    henkilo: any;
    L: Localisations;
    locale: Locale;
    koodisto: KoodistoState;
    setSelection: (arg0: string) => void;
    classNames: any;
    isMaster: boolean;
    header: string;
    styleClasses?: any;
    yksiloitySelected?: boolean;
    vainLuku?: boolean;
    henkiloType: string;
};

type State = {
    checkboxValue: boolean;
};

export default class DuplikaatitPerson extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            checkboxValue: this.props.isMaster,
        };
    }

    render() {
        const henkilo = this.props.henkilo;
        const targetPage = this.props.henkiloType;
        const hakemukset = henkilo.hakemukset
            ? henkilo.hakemukset.map((hakemus: any) => this._parseHakemus(hakemus))
            : undefined;
        const hakemus = (hakemukset && R.head(hakemukset)) || {};
        const muutHakemukset = (hakemukset && R.tail(hakemukset)) || [];
        const styleClasses = classNames(this.props.classNames);
        const L = this.props.L;

        return (
            <div className={styleClasses}>
                <span className="type">{L[this.props.header]}</span>
                <span>{henkilo.hetu}</span>
                <span>
                    {henkilo.yksiloity || henkilo.yksiloityVTJ ? L['HENKILO_YHTEISET_KYLLA'] : L['HENKILO_YHTEISET_EI']}
                </span>
                <span>{henkilo.kutsumanimi}</span>
                <span>{henkilo.etunimet}</span>
                <span>{henkilo.sukunimi}</span>
                <span>{this.renderSukupuoli(henkilo.sukupuoli)}</span>
                <span>{henkilo.syntymaaika}</span>
                <span>
                    <Link className="oph-link" to={`/${targetPage}/${henkilo.oidHenkilo}`}>
                        {henkilo.oidHenkilo}
                    </Link>
                </span>
                <span>{hakemus.kansalaisuus || ''}</span>
                <span>{hakemus.aidinkieli || ''}</span>
                <span>{hakemus.matkapuhelinnumero || ''}</span>
                <span>{hakemus.sahkoposti || ''}</span>
                <span>{hakemus.lahiosoite || ''}</span>
                <span>{hakemus.postinumero || ''}</span>
                <span>{hakemus.passinumero || ''}</span>
                <span>{hakemus.kansallinenIdTunnus || ''}</span>
                <span>{hakemus.state || ''}</span>
                <span>
                    {hakemus.href ? (
                        <a className="oph-link" href={hakemus.href}>
                            {hakemus.oid}
                        </a>
                    ) : (
                        ''
                    )}
                </span>
                <span>
                    {muutHakemukset.length > 0 ? (
                        <DuplikaatitApplicationsPopup
                            popupContent={
                                <DuplikaatitPersonOtherApplications
                                    hakemukset={muutHakemukset}
                                    koodisto={this.props.koodisto}
                                    locale={this.props.locale}
                                    L={this.props.L}
                                />
                            }
                        >
                            {L['DUPLIKAATIT_MUUTHAKEMUKSET']}
                        </DuplikaatitApplicationsPopup>
                    ) : null}
                </span>
                {!this.props.vainLuku && (
                    <span>
                        <input
                            type="checkbox"
                            disabled={
                                this.props.isMaster || (this.props.yksiloitySelected && this.props.henkilo.yksiloity)
                            }
                            checked={this.state.checkboxValue}
                            onChange={this._onCheck.bind(this, henkilo.oidHenkilo)}
                        />
                    </span>
                )}
            </div>
        );
    }

    renderSukupuoli(sukupuoli: string | null | undefined) {
        switch (sukupuoli) {
            case '1':
                return this.props.L['HENKILO_YHTEISET_MIES'];
            case '2':
                return this.props.L['HENKILO_YHTEISET_NAINEN'];
            default:
                return '';
        }
    }

    _onCheck(oid: string) {
        this.setState({
            checkboxValue: !this.state.checkboxValue,
        });
        this.props.setSelection(oid);
    }

    _parseHakemus(hakemus: Hakemus): DuplikaatitHakemus {
        const hakemusData: {
            [key: string]: any;
        } = hakemus.hakemusData;
        return hakemusData.service === 'ataru'
            ? this._parseAtaruHakemus(hakemusData)
            : this._parseHakuappHakemus(hakemusData);
    }

    /*
     * @return DuplikaatitHakemus
     * @params Hakemus
     */
    _parseAtaruHakemus(hakemus: any): any {
        const href = hakemus.haku
            ? `/lomake-editori/applications/search?term=${hakemus.oid}`
            : `/lomake-editori/applications/${hakemus.form}?application-key=${hakemus.oid}`;
        const aidinkieliKoodi = (hakemus.aidinkieli || '').toLocaleLowerCase();
        const aidinkieli = this._koodistoLabel(aidinkieliKoodi, this.props.koodisto.kieli, this.props.locale);
        const kansalaisuus = hakemus.kansalaisuus
            .map((k) => this._koodistoLabel(k.toLocaleLowerCase(), this.props.koodisto.kansalaisuus, this.props.locale))
            .join(', ');

        return {
            oid: hakemus.oid,
            kansalaisuus: kansalaisuus,
            aidinkieli: aidinkieli,
            matkapuhelinnumero: hakemus.matkapuhelin,
            sahkoposti: hakemus.email,
            lahiosoite: hakemus.lahiosoite,
            postinumero: hakemus.postinumero,
            passinumero: hakemus.passinNumero,
            kansallinenIdTunnus: hakemus.idTunnus,
            href: href,
            state: null,
        };
    }

    /*
     * @return DuplikaatitHakemus
     * @params Hakemus
     */
    _parseHakuappHakemus(hakemus: any): any {
        const henkilotiedot = hakemus.answers.henkilotiedot;
        const aidinkieliKoodi = (henkilotiedot.aidinkieli || '').toLocaleLowerCase();
        const aidinkieli = this._koodistoLabel(aidinkieliKoodi, this.props.koodisto.kieli, this.props.locale);
        const kansalaisuusKoodi = (henkilotiedot.kansalaisuus || '').toLocaleLowerCase();
        const kansalaisuus = this._koodistoLabel(
            kansalaisuusKoodi,
            this.props.koodisto.maatjavaltiot1,
            this.props.locale
        );
        return {
            oid: hakemus.oid,
            kansalaisuus: kansalaisuus,
            aidinkieli: aidinkieli,
            matkapuhelinnumero: henkilotiedot.matkapuhelinnumero1,
            sahkoposti: henkilotiedot['Sähköposti'],
            lahiosoite: henkilotiedot.lahiosoite,
            postinumero: henkilotiedot.Postinumero,
            passinumero: henkilotiedot.passinumero,
            kansallinenIdTunnus: henkilotiedot.kansallinenIdTunnus,
            href: `/haku-app/virkailija/hakemus/${hakemus.oid}`,
            state: hakemus.state,
        };
    }

    _koodistoLabel(koodi: any, koodisto: any, locale: Locale): string | null | undefined {
        const koodistoItem = R.find((koodistoItem) => koodistoItem.value === koodi, koodisto);
        return koodistoItem ? koodistoItem[locale] : null;
    }
}
