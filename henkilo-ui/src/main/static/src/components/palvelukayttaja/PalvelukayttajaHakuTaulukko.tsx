import React, { ReactNode } from 'react';
import { Link } from 'react-router';
import { Localisations } from '../../types/localisation.type';
import { PalvelukayttajaRead } from '../../types/domain/kayttooikeus/palvelukayttaja.types';
import { PalvelukayttajatState } from '../../reducers/palvelukayttaja.reducer';
import './PalvelukayttajaHakuTaulukko.css';
import Loader from '../common/icons/Loader';

type PalvelukayttajaHakuTaulukkoProps = {
    L: Localisations;
    palvelukayttajat: PalvelukayttajatState;
};

class PalvelukayttajaHakuTaulukko extends React.Component<PalvelukayttajaHakuTaulukkoProps> {
    render() {
        return (
            <table className="PalvelukayttajaHakuTaulukko">
                <thead>
                    <tr>
                        <th>{this.props.L['HENKILO_PALVELUN_NIMI']}</th>
                        <th>{this.props.L['HENKILO_KAYTTAJANIMI']}</th>
                    </tr>
                </thead>
                <tbody>{this.props.palvelukayttajat.loading ? this.renderLoader() : this.renderData()}</tbody>
            </table>
        );
    }

    renderData = () => {
        return this.props.palvelukayttajat.data.length
            ? this.renderRivit(this.props.palvelukayttajat.data)
            : this.renderKokoRivi(this.props.L['HENKILOHAKU_EI_TULOKSIA']);
    };

    renderRivit(palvelukayttajat: Array<PalvelukayttajaRead>): ReactNode[] {
        return palvelukayttajat.map(this.renderRivi);
    }

    renderRivi(palvelukayttaja: PalvelukayttajaRead): ReactNode {
        return (
            <tr key={palvelukayttaja.oid}>
                <td>
                    <Link to={`/virkailija/${palvelukayttaja.oid}`}>{palvelukayttaja.nimi}</Link>
                </td>
                <td>{palvelukayttaja.kayttajatunnus}</td>
            </tr>
        );
    }

    renderLoader() {
        return this.renderKokoRivi(<Loader />);
    }

    renderKokoRivi(sisalto: ReactNode) {
        return (
            <tr>
                <td colSpan={2}>{sisalto}</td>
            </tr>
        );
    }
}

export default PalvelukayttajaHakuTaulukko;
