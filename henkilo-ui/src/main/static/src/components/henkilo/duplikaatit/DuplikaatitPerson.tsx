import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';

import DuplikaatitApplicationsPopup from './DuplikaatitApplicationsPopup';
import type { Locale } from '../../../types/locale.type';
import type { DuplikaatitHakemus } from '../../../types/duplikaatithakemus.types';
import type { AtaruHakemus, Hakemus, HakuAppHakemus } from '../../../types/domain/oppijanumerorekisteri/Hakemus.type';
import type { HenkiloDuplicate } from '../../../types/domain/oppijanumerorekisteri/HenkiloDuplicate';
import Button from '../../common/button/Button';
import { LinkRelation } from './HenkiloViewDuplikaatit';
import { useLocalisations } from '../../../selectors';
import { Koodi, koodiLabel, useGetKansalaisuudetQuery, useGetKieletQuery } from '../../../api/koodisto';
import { isVahvastiYksiloity } from '../../common/StaticUtils';

import './DuplikaatitPerson.css';

type DuplikaatitPersonProps = {
    henkilo: HenkiloDuplicate;
    hakemukset?: Hakemus[];
    master: HenkiloDuplicate;
    isMaster: boolean;
    canForceLink: boolean;
    vainLuku: boolean;
    henkiloType: string;
    setLink: (link: LinkRelation) => void;
};

type CellProps = React.HTMLAttributes<HTMLSpanElement> & {
    hakemus?: boolean;
    className?: string;
};

const DataCell: React.FC<CellProps> = ({ children, className, hakemus }: CellProps) => (
    <div className={classNames(className, { hakemus: hakemus && children })}>{children}</div>
);

const sukupuolet = {
    1: 'HENKILO_YHTEISET_MIES',
    2: 'HENKILO_YHTEISET_NAINEN',
};

const renderHakemusData = (hakemus: DuplikaatitHakemus | undefined, henkiloType: string) => (
    <>
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
            {hakemus?.hakijaOid && (
                <Link className="oph-link" to={`/${henkiloType}/${hakemus.hakijaOid}`}>
                    {hakemus.hakijaOid}
                </Link>
            )}
        </DataCell>
        <DataCell hakemus>
            {hakemus?.href && (
                <a className="oph-link" href={hakemus?.href}>
                    {hakemus?.oid}
                </a>
            )}
        </DataCell>
    </>
);

const DuplikaatitPerson = (props: DuplikaatitPersonProps) => {
    const { henkilo, master, henkiloType, vainLuku, isMaster, canForceLink, setLink } = props;
    const { data: kielet } = useGetKieletQuery();
    const { data: kansalaisuudet } = useGetKansalaisuudetQuery();
    const { L, locale } = useLocalisations();
    const hakemukset = props.hakemukset ? props.hakemukset.map(_parseHakemus(kansalaisuudet, kielet, locale)) : [];
    const hakemus = hakemukset.shift();
    const vahvastiYksiloity = isVahvastiYksiloity(henkilo);
    const canLinkDuplicateToMaster = !master.passivoitu && !vahvastiYksiloity && (!henkilo.yksiloity || canForceLink);
    const canLinkMasterToDuplicate =
        !henkilo.passivoitu && !isVahvastiYksiloity(master) && (!master.yksiloity || canForceLink);

    return (
        <div className={classNames({ person: true, master: isMaster })}>
            <DataCell className="type">
                {L(isMaster ? 'DUPLIKAATIT_HENKILON_TIEDOT' : 'DUPLIKAATIT_DUPLIKAATTI')}
            </DataCell>
            <DataCell className="type">{L('DUPLIKAATIT_ONR')}</DataCell>
            <DataCell>{henkilo.hetu}</DataCell>
            <DataCell>
                {henkilo.yksiloity || vahvastiYksiloity ? L('HENKILO_YHTEISET_KYLLA') : L('HENKILO_YHTEISET_EI')}
            </DataCell>
            <DataCell>{henkilo.kutsumanimi}</DataCell>
            <DataCell>{henkilo.etunimet}</DataCell>
            <DataCell>{henkilo.sukunimi}</DataCell>

            <DataCell>{L(sukupuolet[henkilo?.sukupuoli ?? 1])}</DataCell>
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
                    ?.map((x) => _koodistoLabel(x.kansalaisuusKoodi, kansalaisuudet, locale))
                    .filter(Boolean)
                    .join(', ')}
            </DataCell>
            <DataCell>{_koodistoLabel(henkilo.aidinkieli?.kieliKoodi, kielet, locale)}</DataCell>
            <DataCell className="type">{L('DUPLIKAATIT_HAKEMUS')}</DataCell>
            {renderHakemusData(hakemus, henkiloType)}
            <DataCell hakemus>
                {!!hakemukset.length && (
                    <DuplikaatitApplicationsPopup title={L('DUPLIKAATIT_MUUTHAKEMUKSET')}>
                        {hakemukset.map((h) => (
                            <div className="application" key={h.oid}>
                                {renderHakemusData(h, henkiloType)}
                            </div>
                        ))}
                    </DuplikaatitApplicationsPopup>
                )}
            </DataCell>
            {!vainLuku && !isMaster && (
                <DataCell>
                    <Button
                        disabled={!canLinkDuplicateToMaster}
                        action={() => setLink({ master, duplicate: henkilo })}
                        dataTestId={`link-duplicate-from-${henkilo.oidHenkilo}`}
                    >
                        {`< ${L('DUPLIKAATIT_YHDISTA_TAMA_DUPLIKAATTI')}`}
                    </Button>
                    <div className="duplicate-separator-container">
                        <span className="duplicate-separator">TAI</span>
                    </div>
                    <Button
                        disabled={!canLinkMasterToDuplicate}
                        action={() => setLink({ master: henkilo, duplicate: master })}
                        dataTestId={`link-main-to-${henkilo.oidHenkilo}`}
                    >
                        {`${L('DUPLIKAATIT_YHDISTA_TAHAN_HENKILOON')} >`}
                    </Button>
                </DataCell>
            )}
        </div>
    );
};

const isAtaruHakemus = (h: AtaruHakemus | HakuAppHakemus): h is AtaruHakemus => h.service === 'ataru';

const _parseHakemus =
    (kansalaisuudet: Koodi[] | undefined, kielet: Koodi[] | undefined, locale: Locale) =>
    (hakemus: Hakemus): DuplikaatitHakemus => {
        const hakemusData = hakemus.hakemusData;
        return isAtaruHakemus(hakemusData)
            ? _parseAtaruHakemus(kansalaisuudet, hakemusData, kielet, locale)
            : _parseHakuappHakemus(kansalaisuudet, hakemusData, kielet, locale);
    };

function _parseAtaruHakemus(
    kansalaisuudet: Koodi[] | undefined,
    hakemus: AtaruHakemus,
    kielet: Koodi[] | undefined,
    locale: Locale
): DuplikaatitHakemus {
    const href = hakemus.haku
        ? `/lomake-editori/applications/search?term=${hakemus.oid}`
        : `/lomake-editori/applications/${hakemus.form}?application-key=${hakemus.oid}`;
    const aidinkieliKoodi = (hakemus.aidinkieli || '').toLocaleLowerCase();
    const aidinkieli = _koodistoLabel(aidinkieliKoodi, kielet, locale);
    const kansalaisuus = hakemus.kansalaisuus
        .map((k) => _koodistoLabel(k.toLocaleLowerCase(), kansalaisuudet, locale))
        .join(', ');

    return {
        oid: hakemus.oid,
        hakijaOid: hakemus.henkiloOid,
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

function _parseHakuappHakemus(
    kansalaisuudet: Koodi[] | undefined,
    hakemus: HakuAppHakemus,
    kielet: Koodi[] | undefined,
    locale: Locale
): DuplikaatitHakemus {
    const henkilotiedot = hakemus.answers?.henkilotiedot;
    const aidinkieliKoodi = (henkilotiedot?.aidinkieli ?? '').toLocaleLowerCase();
    const aidinkieli = _koodistoLabel(aidinkieliKoodi, kielet, locale);
    const kansalaisuusKoodi = (henkilotiedot?.kansalaisuus ?? '').toLocaleLowerCase();
    const kansalaisuus = _koodistoLabel(kansalaisuusKoodi, kansalaisuudet, locale);
    return {
        oid: hakemus.oid,
        hakijaOid: hakemus.personOid,
        kansalaisuus,
        aidinkieli,
        matkapuhelinnumero: henkilotiedot?.matkapuhelinnumero1,
        sahkoposti: henkilotiedot?.['Sähköposti'],
        lahiosoite: henkilotiedot?.lahiosoite,
        postinumero: henkilotiedot?.Postinumero,
        passinumero: henkilotiedot?.passinumero,
        kansallinenIdTunnus: henkilotiedot?.kansallinenIdTunnus,
        href: `/haku-app/virkailija/hakemus/${hakemus.oid}`,
        state: hakemus.state,
    };
}

const _koodistoLabel = (
    koodi: string | undefined,
    koodisto: Koodi[] | undefined,
    locale: Locale
): string | undefined =>
    koodi
        ? koodiLabel(
              koodisto?.find((koodistoItem) => koodistoItem.koodiArvo === koodi),
              locale
          )
        : '';

export default DuplikaatitPerson;
