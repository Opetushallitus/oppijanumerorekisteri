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
import Button from '../../common/button/Button';
import { LinkRelation } from './HenkiloViewDuplikaatit';

type DuplikaatitPersonProps = {
    henkilo: HenkiloDuplicate;
    master: HenkiloDuplicate;
    L: Localisations;
    locale: Locale;
    koodisto: KoodistoState;
    isMaster: boolean;
    canForceLink: boolean;
    vainLuku: boolean;
    henkiloType: string;
    setLink: (link: LinkRelation) => void;
};

type CellProps = React.HTMLAttributes<HTMLSpanElement> & {
    hakemus?: boolean;
};

const DataCell: React.FC<CellProps> = ({ children, className, hakemus }: CellProps) => (
    <div className={classNames(className, { hakemus: hakemus && children })}>{children}</div>
);

const sukupuolet = {
    1: 'HENKILO_YHTEISET_MIES',
    2: 'HENKILO_YHTEISET_NAINEN',
};

const DuplikaatitPerson = (props: DuplikaatitPersonProps) => {
    const { henkilo, master, henkiloType, L, koodisto, locale, vainLuku, isMaster, canForceLink, setLink } = props;
    const hakemukset = henkilo.hakemukset ? henkilo.hakemukset.map(_parseHakemus(koodisto, locale)) : [];
    const hakemus = hakemukset.shift();
    const canLinkDuplicateToMaster =
        !master.passivoitu && !henkilo.yksiloityVTJ && (!henkilo.yksiloity || canForceLink);
    const canLinkMasterToDuplicate = !henkilo.passivoitu && !master.yksiloityVTJ && (!master.yksiloity || canForceLink);

    return (
        <div className={classNames({ person: true, master: isMaster })}>
            <DataCell className="type">
                {L[isMaster ? 'DUPLIKAATIT_HENKILON_TIEDOT' : 'DUPLIKAATIT_DUPLIKAATTI']}
            </DataCell>
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
                    ?.map((x) => _koodistoLabel(x.kansalaisuusKoodi, koodisto.kansalaisuus, locale))
                    .filter(Boolean)
                    .join(', ')}
            </DataCell>
            <DataCell>{_koodistoLabel(henkilo.aidinkieli?.kieliKoodi, koodisto.kieli, locale)}</DataCell>
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
            {!vainLuku && !isMaster && (
                <DataCell>
                    <Button disabled={!canLinkDuplicateToMaster} action={() => setLink({ master, duplicate: henkilo })}>
                        {'< Yhdistä tämä duplikaatti'}
                    </Button>
                    <div className="duplicate-separator-container">
                        <span className="duplicate-separator">TAI</span>
                    </div>
                    <Button
                        disabled={!canLinkMasterToDuplicate}
                        action={() => setLink({ master: henkilo, duplicate: master })}
                    >
                        {'Yhdistä tähän henkilöön >'}
                    </Button>
                </DataCell>
            )}
        </div>
    );
};

const _parseHakemus = (koodisto: KoodistoState, locale: Locale) => (hakemus: Hakemus): DuplikaatitHakemus => {
    const hakemusData = hakemus.hakemusData;
    return hakemusData.service === 'ataru'
        ? _parseAtaruHakemus(hakemusData, koodisto, locale)
        : _parseHakuappHakemus(hakemusData, koodisto, locale);
};

function _parseAtaruHakemus(hakemus: any, koodisto: KoodistoState, locale: Locale): DuplikaatitHakemus {
    const href = hakemus.haku
        ? `/lomake-editori/applications/search?term=${hakemus.oid}`
        : `/lomake-editori/applications/${hakemus.form}?application-key=${hakemus.oid}`;
    const aidinkieliKoodi = (hakemus.aidinkieli || '').toLocaleLowerCase();
    const aidinkieli = _koodistoLabel(aidinkieliKoodi, koodisto.kieli, locale);
    const kansalaisuus = hakemus.kansalaisuus
        .map((k) => _koodistoLabel(k.toLocaleLowerCase(), koodisto.kansalaisuus, locale))
        .join(', ');

    return {
        oid: hakemus.oid,
        kansalaisuus,
        aidinkieli,
        matkapuhelinnumero: hakemus.matkapuhelin,
        sahkoposti: hakemus.email,
        lahiosoite: hakemus.lahiosoite,
        postinumero: hakemus.postinumero,
        passinumero: hakemus.passinNumero,
        kansallinenIdTunnus: hakemus.idTunnus,
        href,
        state: null,
    };
}

function _parseHakuappHakemus(hakemus: any, koodisto: KoodistoState, locale: Locale): DuplikaatitHakemus {
    const henkilotiedot = hakemus.answers?.henkilotiedot || {};
    const aidinkieliKoodi = (henkilotiedot.aidinkieli || '').toLocaleLowerCase();
    const aidinkieli = _koodistoLabel(aidinkieliKoodi, koodisto.kieli, locale);
    const kansalaisuusKoodi = (henkilotiedot.kansalaisuus || '').toLocaleLowerCase();
    const kansalaisuus = _koodistoLabel(kansalaisuusKoodi, koodisto.maatjavaltiot1, locale);
    return {
        oid: hakemus.oid,
        kansalaisuus,
        aidinkieli,
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

const _koodistoLabel = (koodi: string, koodisto: KoodistoStateKoodi[], locale: Locale): string | null =>
    koodisto.find((koodistoItem) => koodistoItem.value === koodi)?.[locale] ?? null;

export default DuplikaatitPerson;
