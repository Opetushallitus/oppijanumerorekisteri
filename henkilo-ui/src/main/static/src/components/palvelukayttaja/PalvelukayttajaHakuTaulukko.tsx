import React, { ReactNode } from 'react';
import { Link } from 'react-router';

import { PalvelukayttajaRead } from '../../types/domain/kayttooikeus/palvelukayttaja.types';
import './PalvelukayttajaHakuTaulukko.css';
import { useLocalisations } from '../../selectors';

type Props = {
    palvelukayttajat: PalvelukayttajaRead[];
};

const PalvelukayttajaHakuTaulukko = ({ palvelukayttajat }: Props) => {
    const { L } = useLocalisations();

    const renderData = () => {
        return palvelukayttajat.length ? renderRivit(palvelukayttajat) : renderKokoRivi(L['HENKILOHAKU_EI_TULOKSIA']);
    };

    function renderRivit(palvelukayttajat: Array<PalvelukayttajaRead>): ReactNode[] {
        return palvelukayttajat.map(renderRivi);
    }

    function renderRivi(palvelukayttaja: PalvelukayttajaRead): ReactNode {
        return (
            <tr key={palvelukayttaja.oid}>
                <td>
                    <Link to={`/virkailija/${palvelukayttaja.oid}`}>{palvelukayttaja.nimi}</Link>
                </td>
                <td>{palvelukayttaja.kayttajatunnus}</td>
            </tr>
        );
    }

    function renderKokoRivi(sisalto: ReactNode) {
        return (
            <tr>
                <td colSpan={2}>{sisalto}</td>
            </tr>
        );
    }

    return (
        <table className="PalvelukayttajaHakuTaulukko">
            <thead>
                <tr>
                    <th>{L['HENKILO_PALVELUN_NIMI']}</th>
                    <th>{L['HENKILO_KAYTTAJANIMI']}</th>
                </tr>
            </thead>
            <tbody>{renderData()}</tbody>
        </table>
    );
};

export default PalvelukayttajaHakuTaulukko;
