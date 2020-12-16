import './RekisteroidyOrganisaatiot.css';
import React from 'react';
import type { KutsuOrganisaatio } from '../../../types/domain/kayttooikeus/Kutsu.types';

type Props = {
    organisaatiot: KutsuOrganisaatio[]
    locale: string;
    L: Record<string, string>;
};

class RekisteroidyOrganisaatiot extends React.Component<Props> {
    render() {
        return (
            <div className="rekisteroidy-organisaatiot-wrapper">
                <p className="oph-h3 oph-bold">{this.props.L['REKISTEROIDY_ORGANISAATIOT_OTSIKKO']}</p>
                {this.props.organisaatiot.map(organisaatio => (
                    <div key={organisaatio.organisaatioOid} className="organisaatio-kayttooikeus-wrapper">
                        <p className="oph-bold">
                            {organisaatio.nimi[this.props.locale] || organisaatio.organisaatioOid}
                        </p>
                        <ul>
                            {organisaatio.kayttoOikeusRyhmat.map(kayttooikeusRyhma => (
                                <li key={kayttooikeusRyhma.id}>
                                    {kayttooikeusRyhma.nimi[this.props.locale] || kayttooikeusRyhma.id}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        );
    }
}

export default RekisteroidyOrganisaatiot;
