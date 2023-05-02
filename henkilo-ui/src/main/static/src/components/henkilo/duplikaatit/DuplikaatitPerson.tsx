import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import './DuplikaatitPerson.css';
import DuplikaatitApplicationsPopup from './DuplikaatitApplicationsPopup';
import DuplikaatitPersonOtherApplications from './DuplikaatitPersonOtherApplications';
import type { Localisations } from '../../../types/localisation.type';
import type { Locale } from '../../../types/locale.type';
import type { KoodistoState, KoodistoStateKoodi } from '../../../reducers/koodisto.reducer';
import type { DuplikaatitHakemus } from '../../../types/duplikaatithakemus.types';
import type { Hakemus } from '../../../types/domain/oppijanumerorekisteri/Hakemus.type';
import type { HenkiloDuplicate } from '../../../types/domain/oppijanumerorekisteri/HenkiloDuplicate';

type Props = {
    henkilo: HenkiloDuplicate;
    L: Localisations;
    locale: Locale;
    koodisto: KoodistoState;
    setSelection: (duplicate: HenkiloDuplicate, add: boolean) => void;
    classNames: { person: boolean; master?: boolean };
    isMaster: boolean;
    header: string;
    canForceLink: boolean;
    vainLuku: boolean;
    henkiloType: string;
    duplicatesIncludeYksiloity: boolean;
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
        const {
            henkilo,
            henkiloType,
            L,
            koodisto,
            locale,
            vainLuku,
            isMaster,
            canForceLink,
            duplicatesIncludeYksiloity,
        } = this.props;
        const hakemukset = henkilo.hakemukset ? henkilo.hakemukset.map((hakemus) => this._parseHakemus(hakemus)) : [];
        const hakemus = hakemukset.shift();
        const isCheckboxDisabled =
            isMaster ||
            henkilo.yksiloityVTJ ||
            (henkilo.yksiloity && !canForceLink) ||
            !henkilo.yksiloity === duplicatesIncludeYksiloity;

        return (
            <div className={classNames(this.props.classNames)}>
                <DataCell className="type">{L[this.props.header]}</DataCell>
                <DataCell className="type">{L['DUPLIKAATIT_ONR']}</DataCell>
                <DataCell>{henkilo.hetu}</DataCell>
                <DataCell>
                    {henkilo.yksiloity || henkilo.yksiloityVTJ ? L['HENKILO_YHTEISET_KYLLA'] : L['HENKILO_YHTEISET_EI']}
                </DataCell>
                <DataCell>{henkilo.kutsumanimi}</DataCell>
                <DataCell>{henkilo.etunimet}</DataCell>
                <DataCell>{henkilo.sukunimi}</DataCell>

                <DataCell>{L[sukupuolet[henkilo.sukupuoli]]}</DataCell>
                <DataCell>{henkilo.syntymaaika}</DataCell>
                <DataCell>
                    <Link className="oph-link" to={`/${henkiloType}/${henkilo.oidHenkilo}`}>
                        {henkilo.oidHenkilo}
                    </Link>
                </DataCell>
                <DataCell>{henkilo.emails?.join(', ')}</DataCell>
                <DataCell>{henkilo.passinumerot?.join(', ')}</DataCell>
                <DataCell>
                    {henkilo.kansalaisuus
                        ?.map((x) => this._koodistoLabel(x.kansalaisuusKoodi, koodisto.kansalaisuus, locale))
                        .filter(Boolean)
                        .join(', ')}
                </DataCell>
                <DataCell>{this._koodistoLabel(henkilo.aidinkieli?.kieliKoodi, koodisto.kieli, locale)}</DataCell>
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
                    {!!hakemukset.length && (
                        <DuplikaatitApplicationsPopup
                            popupContent={
                                <DuplikaatitPersonOtherApplications
                                    hakemukset={hakemukset}
                                    koodisto={koodisto}
                                    locale={locale}
                                    L={L}
                                />
                            }
                        >
                            {L['DUPLIKAATIT_MUUTHAKEMUKSET']}
                        </DuplikaatitApplicationsPopup>
                    )}
                </DataCell>
                {!vainLuku && (
                    <DataCell>
                        <input
                            type="checkbox"
                            disabled={isCheckboxDisabled}
                            checked={this.state.checkboxValue}
                            onChange={this._onCheck.bind(this, henkilo)}
                            data-test-id={`check-duplicate-${henkilo.oidHenkilo}`}
                        />
                    </DataCell>
                )}
            </div>
        );
    }

    _onCheck(duplicate: HenkiloDuplicate) {
        this.props.setSelection(duplicate, !this.state.checkboxValue);
        this.setState({
            checkboxValue: !this.state.checkboxValue,
        });
    }

    _parseHakemus(hakemus: Hakemus): DuplikaatitHakemus {
        const hakemusData = hakemus.hakemusData;
        return hakemusData.service === 'ataru'
            ? this._parseAtaruHakemus(hakemusData)
            : this._parseHakuappHakemus(hakemusData);
    }

    /*
     * @return DuplikaatitHakemus
     * @params Hakemus
     */
    _parseAtaruHakemus(hakemus: any): DuplikaatitHakemus {
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
    _parseHakuappHakemus(hakemus: any): DuplikaatitHakemus {
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

    _koodistoLabel(koodi: string, koodisto: KoodistoStateKoodi[], locale: Locale): string | null {
        const koodistoItem = koodisto.find((koodistoItem) => koodistoItem.value === koodi);
        return koodistoItem ? koodistoItem[locale] : null;
    }
}
