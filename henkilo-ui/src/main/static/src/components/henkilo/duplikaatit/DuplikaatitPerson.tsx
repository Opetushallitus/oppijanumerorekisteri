import React from 'react';
import { Link } from 'react-router';
import * as R from 'ramda';
import classNames from 'classnames';
import './DuplikaatitPerson.css';
import DuplikaatitApplicationsPopup from './DuplikaatitApplicationsPopup';
import DuplikaatitPersonOtherApplications from './DuplikaatitPersonOtherApplications';
import type { Localisations } from '../../../types/localisation.type';
import type { Locale } from '../../../types/locale.type';
import type { KoodistoState } from '../../../reducers/koodisto.reducer';
import type { DuplikaatitHakemus } from '../../../types/duplikaatithakemus.types';
import type { Hakemus } from '../../../types/domain/oppijanumerorekisteri/Hakemus.type';
import type { HenkiloDuplicate } from '../../../types/domain/oppijanumerorekisteri/HenkiloDuplicate';

type Props = {
    henkilo: HenkiloDuplicate;
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

type CellProps = React.HTMLAttributes<HTMLSpanElement> & {
    hakemus?: boolean;
};

const DataCell: React.FC<CellProps> = ({ children, className, hakemus }: CellProps) => (
    <span className={classNames(className, { hakemus: hakemus && children })}>{children}</span>
);

const sukupuolet = {
    1: 'HENKILO_YHTEISET_MIES',
    2: 'HENKILO_YHTEISET_NAINEN',
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
            ? henkilo.hakemukset.map((hakemus) => this._parseHakemus(hakemus))
            : [];
        const hakemus = hakemukset[0];
        const muutHakemukset = (hakemukset && R.tail(hakemukset)) || [];
        const styleClasses = classNames(this.props.classNames);
        const L = this.props.L;

        return (
            <div className={styleClasses}>
                <DataCell className="type">{L[this.props.header]}</DataCell>
                <DataCell className="type">{L['DUPLIKAATIT_ONR']}</DataCell>
                <DataCell>{henkilo.hetu}</DataCell>
                <DataCell>
                    {henkilo.yksiloity || henkilo.yksiloityVTJ ? L['HENKILO_YHTEISET_KYLLA'] : L['HENKILO_YHTEISET_EI']}
                </DataCell>
                <DataCell>{henkilo.kutsumanimi}</DataCell>
                <DataCell>{henkilo.etunimet}</DataCell>
                <DataCell>{henkilo.sukunimi}</DataCell>

                <DataCell>{this.props.L[sukupuolet[henkilo.sukupuoli]]}</DataCell>
                <DataCell>{henkilo.syntymaaika}</DataCell>
                <DataCell>
                    <Link className="oph-link" to={`/${targetPage}/${henkilo.oidHenkilo}`}>
                        {henkilo.oidHenkilo}
                    </Link>
                </DataCell>
                <DataCell>{(henkilo.emails || []).join(', ')}</DataCell>
                <DataCell>{(henkilo.passinumerot || []).join(', ')}</DataCell>
                <DataCell>
                    {(henkilo.kansalaisuus || [])
                        .map((x) =>
                            this._koodistoLabel(
                                x.kansalaisuusKoodi,
                                this.props.koodisto.kansalaisuus,
                                this.props.locale
                            )
                        )
                        .filter(Boolean)
                        .join(', ')}
                </DataCell>
                <DataCell>
                    {this._koodistoLabel(henkilo.aidinkieli?.kieliKoodi, this.props.koodisto.kieli, this.props.locale)}
                </DataCell>
                <DataCell className="type">{L['DUPLIKAATIT_HAKEMUS']}</DataCell>
                <DataCell hakemus>{hakemus?.kansalaisuus}</DataCell>
                <DataCell hakemus>{hakemus?.aidinkieli}</DataCell>
                <DataCell hakemus>{hakemus?.matkapuhelinnumero}</DataCell>
                <DataCell hakemus>{hakemus?.sahkoposti}</DataCell>
                <DataCell hakemus>{hakemus?.lahiosoite}</DataCell>
                <DataCell hakemus>{hakemus?.postinumero}</DataCell>
                <DataCell hakemus>{hakemus?.passinumero}</DataCell>
                <DataCell hakemus>{hakemus?.kansallinenIdTunnus}</DataCell>
                <DataCell hakemus>{hakemus?.state}</DataCell>
                <DataCell hakemus>
                    {hakemus?.href && (
                        <a className="oph-link" href={hakemus?.href}>
                            {hakemus?.oid}
                        </a>
                    )}
                </DataCell>
                <DataCell hakemus>
                    {!!muutHakemukset.length && (
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
                    )}
                </DataCell>
                {!this.props.vainLuku && (
                    <DataCell>
                        <input
                            type="checkbox"
                            disabled={
                                this.props.isMaster || (this.props.yksiloitySelected && this.props.henkilo.yksiloity)
                            }
                            checked={this.state.checkboxValue}
                            onChange={this._onCheck.bind(this, henkilo.oidHenkilo)}
                        />
                    </DataCell>
                )}
            </div>
        );
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
        const henkilotiedot = hakemus.answers?.henkilotiedot || {};
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

    _koodistoLabel(koodi: any, koodisto: any, locale: Locale): string | null {
        const koodistoItem = R.find((koodistoItem: any) => koodistoItem.value === koodi, koodisto);
        return koodistoItem ? koodistoItem[locale] : null;
    }
}
